/**
@notice © Copyright 2018 EYGS LLP and/or other members of the global Ernst & Young/EY network; pat. pending.

Example contract to enable the management of ZKSnark-hidden coin transactions.
Only a (very basic) 'mint' function is given in this example implementation. In reality a 'transfer' and 'burn' function would be required.

Do not use this example in any production code!
*/

pragma solidity ^0.4.24;

import "./Ownable.sol"; //Ownable functions allow initializers to be re-initialised every time an upgrade happens
import "./Coin.sol"; //ERC-20 contract
import "./Verifier_Interface.sol";

contract ExampleCoinShield is Ownable {

    event Mint(uint256 amount, bytes32 zCoin);

    event VerifierChanged(address newVerifierContract);


    uint private balance = 0;
    mapping(bytes32 => bytes32) public zs; //mapping holding the commitments.
    Verifier_Interface public v; //the verification smart contract
    Coin public coin; //the Coin ERC20-like token contract


    constructor(address _verifierContract, address _coin) public {
        v = Verifier_Interface(_verifierContract);
        coin = Coin(_coin);
    }

    //function to change the address of the underlying Verifier contract
    function changeVerifier(address newVerifierContract) public onlyOwner {
        v = Verifier_Interface(newVerifierContract);
        emit VerifierChanged(newVerifierContract);
    }

    /**
    self destruct
    */
    function close() public onlyOwner {
        selfdestruct(_owner);
    }

    /**
    The mint function accepts coin and creates the same amount as a commitment.
    */
    function mint(uint256 amount, uint256[] _proof, uint256[] _inputs, bytes32 _vkId) public payable {

        bool result = v.verify(_proof, _inputs, _vkId);

        require(result, "The proof has not been verified by the contract");

        //transfer coin from the sender to this contract
        coin.transferFrom(msg.sender, address(this), amount);
        require(_inputs[0]==amount, "Payment amount mismatch"); //check we've been correctly paid

        bytes32 z = bytes32(_inputs[1]);

        zs[z] = z; //add the token

        emit Mint(amount, z);
    }


    function getVerifier() public view returns(address){
        return address(v);
    }

    function getCoin() public view returns(address){
        return address(coin);
    }

}
