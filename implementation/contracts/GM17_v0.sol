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
@title GM17_v0
@dev Example Verifier Implementation - GM17 proof verification.
@notice Do not use this example in any production code!
*/

pragma solidity ^0.4.24;

import "./Ownable.sol"; //Ownable functions allow initializers to be re-initialised every time an upgrade happens
import "./GM17_lib_v0.sol";
import "./Pairing_v1.sol";
import "./Verifier_Registry_Interface.sol";

contract GM17_v0 is Ownable {

  using GM17_lib_v0 for GM17_lib_v0.Vk_GM17_v0;
  using GM17_lib_v0 for GM17_lib_v0.Proof_GM17_v0;
  using Pairing_v1 for *;

  event Verified(bytes32 indexed _proofId, bytes32 indexed _vkId);

  event NotVerified(bytes32 indexed _proofId, bytes32 indexed _vkId);


  bool internal _initialized;
  Verifier_Registry_Interface public R; //R for 'Registry'
  address[] public _this;


  //constructor will be used in initial tests until proxy gets finalised.
  constructor(address _registry) public {
      registerMe(_registry);
      _this.push(address(this));
  }

  modifier onlyRegistry() {
    require(msg.sender == address(R));
    _;
  }


  function registerMe(address _registry) internal {
      R = Verifier_Registry_Interface(_registry);
      require(R.registerVerifierContract(address(this)), "Registration of this Verifier contract has failed");
  }


//DOESN'T WORK IN TRUFFLE TESTS - BUT IT SHOULD.
  function verify(uint256[] _proof, uint256[] _inputs, bytes32 _vkId) public returns (bool result) {

      bytes32 proofId;

      proofId = R.submitProof(_proof, _inputs, _vkId, address(this));
      //R.attestProof(proofId, _vkId, true);

      if (verificationCalculation(_proof, _inputs, _vkId) == 0) {
          emit Verified(proofId, _vkId);
          //R.attestProof(proofId, _vkId, true); //this call after the elliptic curve calculations is what breaks the test. If we replace the elliptic curve check with just 'true', then this calls correctly - so it could be a gas limit thing.

          result = true;

      } else {
          emit NotVerified(proofId, _vkId);
          //R.attestProof(proofId, _vkId, false); //this call after the elliptic curve calculations is what breaks the test. If we replace the elliptic curve check with just 'true', then this calls correctly - so it could be a gas limit thing.

          result = false;

      }
      //R.attestProof(proofId, _vkId, result);

      return result;
  }

  function verifyFromRegistry(uint256[] _proof, uint256[] _inputs, bytes32 _vkId) external onlyRegistry returns (bool result) {

      if (verificationCalculation(_proof, _inputs, _vkId) == 0) {
          result = true;
      } else {
          result = false;
      }

      return result;
  }

  //NOTE: this is an internal function - made public only for truffle testing.
  function verificationCalculation(uint256[] _proof, uint256[] _inputs, bytes32 _vkId) public returns (uint) {

      GM17_lib_v0.Proof_GM17_v0 memory proof;
      Points.G1Point memory vk_dot_inputs;
      uint256[] memory _vk;
      GM17_lib_v0.Vk_GM17_v0 storage vk;

      vk_dot_inputs = Points.G1Point(0, 0); //initialise

      //get this vk from the registry
      _vk = R.getVk(_vkId);

      proof.A = Points.G1Point(_proof[0], _proof[1]);
      proof.B = Points.G2Point([_proof[2], _proof[3]], [_proof[4], _proof[5]]);
      proof.C = Points.G1Point(_proof[6], _proof[7]);

      vk.H = Points.G2Point([_vk[0],_vk[1]],[_vk[2],_vk[3]]);
      vk.Galpha = Points.G1Point(_vk[4],_vk[5]);
      vk.Hbeta = Points.G2Point([_vk[6],_vk[7]],[_vk[8],_vk[9]]);
      vk.Ggamma = Points.G1Point(_vk[10],_vk[11]);
      vk.Hgamma = Points.G2Point([_vk[12],_vk[13]],[_vk[14],_vk[15]]);

      vk.query.length = (_vk.length - 16)/2;
      uint j = 0;
      for (uint i = 16; i < _vk.length; i+=2) {
        vk.query[j++] = Points.G1Point(_vk[i],_vk[i+1]);
      }

      require(_inputs.length + 1 == vk.query.length, "Length of inputs[] or vk.query is incorrect!");

      for (i = 0; i < _inputs.length; i++)
          vk_dot_inputs = Pairing_v1.addition(vk_dot_inputs, Pairing_v1.scalar_mul(vk.query[i + 1], _inputs[i]));

      vk_dot_inputs = Pairing_v1.addition(vk_dot_inputs, vk.query[0]);

      /**
       * e(A*G^{alpha}, B*H^{beta}) = e(G^{alpha}, H^{beta}) * e(G^{psi}, H^{gamma})
       *                              * e(C, H)
       * where psi = \sum_{i=0}^l input_i pvk.query[i]
       */
      if (!Pairing_v1.pairingProd4(vk.Galpha, vk.Hbeta, vk_dot_inputs, vk.Hgamma, proof.C, vk.H, Pairing_v1.negate(Pairing_v1.addition(proof.A, vk.Galpha)), Pairing_v1.addition2(proof.B, vk.Hbeta))) {
          return 1;
      }


      /**
       * e(A, H^{gamma}) = e(G^{gamma}, B)
       */
      if (!Pairing_v1.pairingProd2(proof.A, vk.Hgamma, Pairing_v1.negate(vk.Ggamma), proof.B)) {
          return 2;
      }

      delete proof;
      delete vk_dot_inputs;
      delete _vk;
      delete vk.H;
      delete vk.Galpha;
      delete vk.Hbeta;
      delete vk.Ggamma;
      delete vk.Hgamma;
      delete vk.query;

      return 0;

  }

  function getRegistry() external view returns (address) {
    return address(R);
  }

}
