/**
CREDITS:

// For the Elliptic Curve Pairing operations and functions verify() and verifyCalculation():
// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


Standardisation effort:

Interface proposal & example implementation by Michael Connor, EY, 2019, including:
Functions, arrangement, logic, inheritance structure, and interactions with a proposed Verifier_Registry interface.

With thanks to:
Duncan Westland
Chaitanya Konda
Harry R
*/

/**
@title PGHR13_v0
@dev Example Verifier Implementation - PGHR13 proof verification.
@notice Do not use this example in any production code!
*/

pragma solidity ^0.4.24;

import "./Ownable.sol"; //Ownable functions allow the initializer to be re-initialised every time an upgrade happens
import "./PGHR13_lib_v0.sol";
import "./Pairing_v0.sol";
import "./Verifier_Registry_Interface.sol";

contract PGHR13_v0 is Ownable {

  using PGHR13_lib_v0 for PGHR13_lib_v0.Vk_PGHR13_v0;
  using PGHR13_lib_v0 for PGHR13_lib_v0.Proof_PGHR13_v0;
  using Pairing_v0 for *;

  event Verified(bytes32 indexed _proofId, bytes32 indexed _vkId);

  event NotVerified(bytes32 indexed _proofId, bytes32 indexed _vkId);

  event NewVkLoaded(bytes32 indexed _vkId);


  bool internal _initialized;
  Verifier_Registry_Interface public R; //R for 'Registry'
  address[] public _this;

  //constructor will be used in initial tests until proxy gets finalised.
  constructor(address _registry) public {
      registerMe(_registry);
      _this.push(address(this));
  }

  //this will become the contract's constructor once proxy gets finalised.
  function initialize(address _owner, address _registry) public {
      require(!_initialized);
      setOwner(_owner);
      registerMe(_registry);
      _initialized = true;
  }

  function registerMe(address _registry) internal {
      R = Verifier_Registry_Interface(_registry);
      require(R.registerVerifierContract(address(this)), "Registration of this Verifier contract has failed");
  }

  function loadVk(uint256[] _vk) public {

      bytes32 vkId;

      //register this vk with the registry
      vkId = R.registerVk(_vk, _this);//this loads the vk into the storage of the verifierRegistry. It's cheaper to call the registry directly, but we'll keep this loadVk function here (in this contract) for Standardisation and Completeness.

      emit NewVkLoaded(vkId);
  }

//DOESN'T WORK IN TRUFFLE TESTS - BUT IT SHOULD.
  function verify(uint256[] _proof, uint64[] _inputs, bytes32 _vkId) public returns (bool) {

      bytes32 proofId;

      proofId = R.submitProof(_proof, _inputs, _vkId, address(this));
      //R.attestProof(proofId, _vkId, true);

      if (verificationCalculation(_proof, _inputs, _vkId) == 0) {
          emit Verified(proofId, _vkId);
          //R.attestProof(proofId, _vkId, true); //this call after the elliptic curve calculations is what breaks the test. If we replace the elliptic curve check with just 'true', then this calls correctly - so it could be a gas limit thing.

          return true;

      } else {
          emit NotVerified(proofId, _vkId);
          //R.attestProof(proofId, _vkId, false); //this call after the elliptic curve calculations is what breaks the test. If we replace the elliptic curve check with just 'true', then this calls correctly - so it could be a gas limit thing.

          return false;

      }
  }

  function verify(uint256[] _proof, uint64[] _inputs, bytes32 _vkId, bytes32 _proofId) public returns (bool) {

      require(_proofId == R.createNewProofId(_proof, _inputs), "Invalid proofId");

      if (verificationCalculation(_proof, _inputs, _vkId) == 0) {
          emit Verified(_proofId, _vkId);

          return true;

      } else {
          emit NotVerified(_proofId, _vkId);

          return false;

      }
  }

  //NOTE: this is an internal function - made public only for truffle testing.
  function verificationCalculation(uint256[] _proof, uint64[] _inputs, bytes32 _vkId) public returns (uint) {

      PGHR13_lib_v0.Proof_PGHR13_v0 memory proof;
      Points.G1Point memory vk_dot_inputs;
      uint256[] memory _vk;
      PGHR13_lib_v0.Vk_PGHR13_v0 storage vk;

      vk_dot_inputs = Points.G1Point(0, 0); //initialise

      //get this vk from the registry
      _vk = R.getVk(_vkId);

      proof.A = Points.G1Point(_proof[0], _proof[1]);
      proof.A_p = Points.G1Point(_proof[2], _proof[3]);
      proof.B = Points.G2Point([_proof[4], _proof[5]], [_proof[6], _proof[7]]);
      proof.B_p = Points.G1Point(_proof[8], _proof[9]);
      proof.C = Points.G1Point(_proof[10], _proof[11]);
      proof.C_p = Points.G1Point(_proof[12], _proof[13]);
      proof.H = Points.G1Point(_proof[14], _proof[15]);
      proof.K = Points.G1Point(_proof[16], _proof[17]);

      vk.A = Points.G2Point([_vk[0],_vk[1]],[_vk[2],_vk[3]]);
      vk.B = Points.G1Point(_vk[4],_vk[5]);
      vk.C = Points.G2Point([_vk[6],_vk[7]],[_vk[8],_vk[9]]);
      vk.gamma = Points.G2Point([_vk[10],_vk[11]],[_vk[12],_vk[13]]);
      vk.gammaBeta1 = Points.G1Point(_vk[14],_vk[15]);
      vk.gammaBeta2 = Points.G2Point([_vk[16],_vk[17]],[_vk[18],_vk[19]]);
      vk.Z = Points.G2Point([_vk[20],_vk[21]],[_vk[22],_vk[23]]);

      vk.IC.length = (_vk.length - 24)/2;
      uint j = 0;
      for (uint i = 24; i < _vk.length; i+=2) {
        vk.IC[j++] = Points.G1Point(_vk[i],_vk[i+1]);
      }

      require(_inputs.length + 1 == vk.IC.length, "Length of inputs[] or vk.IC is incorrect!");

      for (i = 0; i < _inputs.length; i++)
          vk_dot_inputs = Pairing_v0.addition(vk_dot_inputs, Pairing_v0.scalar_mul(vk.IC[i + 1], _inputs[i]));

      vk_dot_inputs = Pairing_v0.addition(vk_dot_inputs, vk.IC[0]);


      if (!Pairing_v0.pairingProd2(proof.A, vk.A, Pairing_v0.negate(proof.A_p), Pairing_v0.P2())) {
          return 1;
      }

      if (!Pairing_v0.pairingProd2(vk.B, proof.B, Pairing_v0.negate(proof.B_p), Pairing_v0.P2())) {
          return 2;
      }

      if (!Pairing_v0.pairingProd2(proof.C, vk.C, Pairing_v0.negate(proof.C_p), Pairing_v0.P2())) {
          return 3;
      }

      if (!Pairing_v0.pairingProd3(
          proof.K, vk.gamma,
          Pairing_v0.negate(Pairing_v0.addition(vk_dot_inputs, Pairing_v0.addition(proof.A, proof.C))), vk.gammaBeta2,
          Pairing_v0.negate(vk.gammaBeta1), proof.B
      )) {
          return 4;
      }

      if (!Pairing_v0.pairingProd3(
              Pairing_v0.addition(vk_dot_inputs, proof.A), proof.B,
              Pairing_v0.negate(proof.H), vk.Z,
              Pairing_v0.negate(proof.C), Pairing_v0.P2()
      )) {
          return 5;
      }

      delete proof;
      delete vk_dot_inputs;
      delete _vk;
      delete vk.IC;

      return 0;

  }

}
