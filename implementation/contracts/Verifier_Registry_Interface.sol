/**
CREDITS:

Standardisation effort:

Interface proposal & example implementation by Michael Connor, EY, 2019,
including:
Functions, arrangement, logic, inheritance structure, and interactions with a proposed Verifier interface.

With thanks to:
Duncan Westland
Chaitanya Konda
Harry R
*/

/**
@title Verifier_Interface
@dev Example Verifier Implementation - to be imported by Verifier contracts and other dependent contracts.
@notice Do not use this example in any production code!
*/

pragma solidity ^0.4.25;

//Imported by verifier contracts.
interface Verifier_Registry_Interface{

    event NewProofSubmitted(bytes32 indexed _proofId, uint256[] _proof, uint64[] _inputs);

    event NewVkRegistered(bytes32 indexed _vkId);

    event NewVerifierContractRegistered(address indexed _contractAddress);

    event NewAttestation(bytes32 indexed _proofId, address indexed _verifier, bool indexed _result);


    function getVk(bytes32 _vkId) external returns (uint256[]);

    function registerVerifierContract(address _verifierContract) external returns (bool);

    function registerVk(uint256[] _vk, address[] _verifierContracts) external returns (bytes32);

    function submitProof(uint256[] _proof, uint256[] _inputs, bytes32 _vkId) external returns (bytes32);

    function submitProof(uint256[] _proof, uint256[] _inputs, bytes32 _vkId, address _verifierContract) external returns (bytes32);

    function submitProofAndVerify(uint256[] _proof, uint256[] _inputs, bytes32 _vkId, address _verifierContract) external returns (bytes32);

    function attestProof(bytes32 _proofId, bytes32 _vkId, bool _result) external;

    function attestProofs(bytes32[] _proofIds, bytes32[] _vkIds, bool[] _results) external;

    function challengeAttestation(bytes32 _proofId, uint256[] _proof, uint256[] _inputs, address _verifierContract) external;

    function createNewVkId(uint256[] _vk) external pure returns (bytes32);

    function createNewProofId(uint256[] _proof, uint256[] _inputs) external pure returns (bytes32);

}
