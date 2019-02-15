/**
CREDITS:

Standardisation effort:

Interface proposal & example implementation by Michael Connor, EY, 2019,
including:
Functions, arrangement, logic, inheritance structure, and interactions with a proposed Verifier Registry interface.

With thanks to:
Duncan Westland
Chaitanya Konda
Harry R
*/

/**
@title Verifier_Interface
@dev Example Verifier Implementation - to be imported by the proposed Verifier Registry and other dependent contracts.
@notice Do not use this example in any production code!
*/

pragma solidity ^0.4.24;

interface Verifier_Interface {

  event Verified(bytes32 indexed _proofId, bytes32 indexed _vkId);

  event NotVerified(bytes32 indexed _proofId, bytes32 indexed _vkId);

  event NewVkLoaded(bytes32 indexed _vkId);

  function initialize(address _owner, address _registry) external;

  function loadVk(uint256[] _vk) external;

  function verify(uint256[] _proof, uint64[] _inputs, bytes32 _vkId) external returns (bool);

  function verify(uint256[] _proof, uint64[] _inputs, bytes32 _vkId, bytes32 _proofId) external returns (bool);

}
