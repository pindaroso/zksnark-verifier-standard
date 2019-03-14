---
eip: To be assigned <to be assigned>
title: zk-SNARK verifier standard
authors: Michael Connor<michael.connor@uk.ey.com>, Chaitanya Konda<chaitanya.konda@uk.ey.com>, Duncan Westland<duncan.westland@uk.ey.com>
thanks: Paul Brody<paul.brody@ey.com>, Harry R
discussions-to: EY <https://github.com/EYBlockchain/zksnark-verifier-standard>
status: WIP
type: Standards Track
category: ERC
created: 2018-09-14
requires: 165, 196, 197
---

<!--You can leave these HTML comments in your merged EIP and delete the visible duplicate text guides, they will not appear and may be helpful to refer to if you edit it again. This is the suggested template for new EIPs. Note that an EIP number will be assigned by an editor. When opening a pull request to submit your EIP, please use an abbreviated title in the filename, `eip-draft_title_abbrev.md`. The title should be 44 characters or less.-->
## Contents
[Simple Summary](#simple-summary)  
[Abstract](#abstract)  
[Motivation](#motivation)  
[Specification](#specification)  
[Rationale](#rationale)  
[Backwards Compatibility](#backwards-compatibility)  
[Test Cases](#test-cases)  
[Implementations](#implementations)  
[References](#references)  
[Copyright](#copyright)  

## Simple Summary


<!--"If you can't explain it simply, you don't understand it well enough." Provide a simplified and layman-accessible explanation of the EIP.-->
A standard interface for 'Verifier' contracts which verify [zk-SNARKs](#4).

<sub><sub>[Back to top](#contents)</sub></sub>

## Abstract
<!--A short (~200 word) description of the technical issue being addressed.-->
The following 'Standard' allows for the implementation of a standard contract API for the verification of [zk-SNARKs](#4) ('zero knowledge - Succinct, Non-Interactive, ARguments of Knowledge', a.k.a. 'Proofs', 'Arguments' or 'Commitments').

This Standard provides basic functionality to load all necessary parameters for the verification of any zk-SNARK into a Verifier contract, so that it may ultimately return a `true` or `false` response; corresponding to whether the Proof has been verified or not verified.

<sub><sub>[Back to top](#contents)</sub></sub>

## Motivation
<!--The motivation is critical for EIPs that want to change the Ethereum protocol. It should clearly explain why the existing protocol specification is inadequate to address the problem that the EIP solves. EIP submissions without sufficient motivation may be rejected outright.-->
zk-SNARKs are a promising area of interest for the Ethereum community. Key applications of zk-SNARKs include:
- Private transactions
- Private computations
- Ethereum scaling through proofs of 'bundled' transactions

A standard interface for verifying all [zk-SNARKs](#4) will allow applications to more easily implement private transactions, private contracts, and scaling solutions; and to extract and interpret the limited information which gets emitted during zk-SNARK verifications.

This standard was initially proposed by [EY](https://www.ey.com), and was inspired in particular by the requirements of businesses wishing to keep their agreements, transactions, and supply chain activities confidential - all whilst still benefiting from the commonly cited strengths of blockchains and smart contracts.

<sub><sub>[Back to top](#contents)</sub></sub>

## Specification
<!--The technical specification should describe the syntax and semantics of any new feature. The specification should be detailed enough to allow competing, interoperable implementations for any of the current Ethereum platforms (go-ethereum, parity, cpp-ethereum, ethereumj, ethereumjs, and [others](https://github.com/ethereum/wiki/wiki/Clients)).-->


```solidity
pragma solidity ^0.4.24;


/// @title EIP-XXXX Token Commitment Standard
/// @dev See https://github.com/EYBlockchain/zksnark-verifier-standard
///  Note: the ERC-165 identifier for this interface is 0xXXXXXXXXX.

interface EIP-XXXX /* is ERC165 */ {

/// EVENTS

  /// No events are specified.



/// FUNCTIONS

/// Notation:
/// - Public Input Vector: often denoted as a vector 'x' in zk-SNARKs
///    literature. An arithmetic circuit function is created as an abstraction
///    of a particular type of zk-SNARK.
///    The arithmetic circuit takes two parameters; the Public Input Vector,
///    'x', and a secret 'witness' vector, 'w'.
///    This interface standardises functions which can load the Public Input
///    Vector into this Verifier contract.
/// - Verifying Key: A 'trusted setup' calculation creates both a public
///    'Proving Key' 'pk' and a public 'Verifying Key' 'vk' from an arithmetic
///    circuit.
///    This interface standardises functions which can load the Verifying Key
///    into this Verifier contract.
/// - Proof: A 'prover' who wants to 'prove' their standard generates a
///    'proof' from: the proving key; their secret witness vector 'w'; and its
///    corresponding Public Input Vector 'x.'


  /// verify

    /// @notice Checks the arguments of the Proof, through elliptic curve
    ///  pairing functions.
    /// @dev
    ///  MUST return `true` if the Proof passes all checks (i.e. if the Proof is
    ///  valid). MUST emit the Verified event in this case.
    ///  MUST return `false` if the Proof does not pass all checks (i.e. if the
    ///  Proof is invalid). MUST emit the NotVerified event in this case.
    /// @param {uint256[]} _proof A zk-SNARK.
    /// @param {uint256[]} _inputs Public inputs which accompany the _proof.
    /// @param {uint256} _vkId A unique identifier (known to this verifier
    ///  contract) for the Verifying Key to which the _proof corresponds.
    /// @return {bool} The result of the verification calculation.

    function verify(uint256[] _proof, uint64[] _inputs, bytes32 _vkId) external returns (bool) {}


  /// verifyFromRegistry

    /// @notice Checks the arguments of the Proof, through elliptic curve
    ///  pairing functions.
    /// @dev
    ///  MUST return `true` if the Proof passes all checks (i.e. if the Proof is
    ///  valid). MUST emit the Verified event in this case.
    ///  MUST return `false` if the Proof does not pass all checks (i.e. if the
    ///  Proof is invalid). MUST emit the NotVerified event in this case.
    /// @param {uint256[]} _proof A zk-SNARK.
    /// @param {uint256[]} _inputs Public inputs which accompany the _proof.
    /// @param {uint256} _vkId A unique identifier (known to this verifier
    ///  contract) for the Verifying Key to which the _proof corresponds.
    /// @return {bool} The result of the verification calculation.

    function verifyFromRegistry(uint256[] _proof, uint64[] _inputs, bytes32 _vkId) external returns (bool) {}


}
```
### Interface
``` solidity
interface ERC165 {

  /// supportsInterface

    /// @notice Query if a contract implements an interface
    /// @param interfaceID The interface identifier, as specified in ERC-165
    /// @dev Interface identification is specified in ERC-165. This function
    ///  uses less than 30,000 gas.
    /// @return `true` if the contract implements `interfaceID` and
    ///  `interfaceID` is not 0xffffffff, `false` otherwise

    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}
```

## Rationale
<!--The rationale fleshes out the specification by describing what motivated the design and why particular design decisions were made. It should describe alternate designs that were considered and related work, e.g. how the feature is supported in other languages. The rationale may also provide evidence of consensus within the community, and should discuss important objections or concerns raised during discussion.-->

### Taxonomy

$C$ - A satisfiable arithmetic circuit abstraction of a function.

$\lambda$ - A random number, generated at the 'setup' phase - commonly referred to as 'toxic waste', because knowledge of $\lambda$ would allow an untrustworthy party to create 'false' proofs which would verify as 'true'. $\lambda$ must be destroyed.

$pk$ or `_pk` - The proving key for a particular circuit $C$.

$vk$ or `_vk` - The verifying key for a particular circuit $C$.

Both $pk$ and $vk$ are generated as a pair by some function $G$:
$$(pk, vk) = G(\lambda, C)$$

Note: $C$ can be represented unambiguously by either of `pk` or `vk`. In zk-SNARK constructions, `vk` is much smaller in size than `pk`, so as to enable succinct verification on-chain. Hence, `vk` is the representative of $C$ that we 'load' into the Verifier contract (through `loadVk`) and hence it is the representative of $C$ that is 'known' to the contract. Therefore, we can identify each circuit uniquely through some `vkId`, where `vkId` serves as a more succinct mapping to `vk`.

$w$ - A 'private witness' string. A private argument to the circuit $C$ known only to the prover, which, when combined with the Public Input Vector argument $x$, comprises an argument of knowledge which satisfies the circuit $C$.

$x$ or `_input` - A 'Public Input Vector'. A public argument to the circuit $C$ which, when combined with the private witness string $w$, comprises an argument of knowledge which satisfies the circuit $C$.

$\pi$ or `_proof` - an encoded vector of values which represents the 'prover's' 'argument of knowledge' of values $w$ and $x$ which satisfy the circuit $C$.
$$\pi = P(pk, x, w)$$

Note: A single circuit $C$ could have very many distinct satisfying arguments, $\pi_i$, and so each (`_proof`, `_input`) pair requires its own unique `_proofId` (the set of valid proofs maps surjectively onto the set of satisfiable circuits). Uniqueness of `_proofId`'s is important.

The ultimate purpose of a Verifier contract, as specified in this EIP, is to verify a proof (of the form $\pi$) through some verification function $V$.

$$V(vk, x, \pi)=\begin{cases}
    1, & \text{if $\exists w\ s.t.\ C(x,w)=1$}.\\
    0, & \text{otherwise}.
  \end{cases}$$
The `verify()` function of this specification serves the purpose of $V$; returning either `true` (the proof has been verified to satisfy the arithmetic circuit) or `false` (the proof has not been verified).


<sub><sub>[Back to top](#contents)</sub></sub>


## Backwards Compatibility
<!--All EIPs that introduce backwards incompatibilities must include a section describing these incompatibilities and their severity. The EIP must explain how the author proposes to deal with these incompatibilities. EIP submissions without a sufficient backwards compatibility treatise may be rejected outright.-->
- At the time this EIP was first proposed, there was only one known and working set of Verifier contracts for zk-SNARKs on the Ethereum mainnet - deployed by [EY](https://www.ey.com).
[EY's](https://www.ey.com) initial [implementation](#implementations) does not exactly adhere to the draft specification of this EIP, but EY have agreed that there is no need to provide backwards compatibility with their initial implementation.

- Dr Christian Reitwiessner's excellent [example](#6.5) of a Verifier contract and elliptic curve pairing library has been instrumental in the Ethereum community's experimentation and development of zk-SNARK protocols. Many of the naming conventions of this EIP have been kept consistent with his example.

- Existing zk-SNARK compilers such as [ZoKrates](#6.3), which produce 'Verifier.sol' contracts, do not currently produce Verifier contracts which adhere to this EIP specification.

<sub><sub>[Back to top](#contents)</sub></sub>


## Test Cases
<!--Test cases for an implementation are mandatory for EIPs that are affecting consensus changes. Other EIPs can choose to include links to test cases if applicable.-->

Truffle tests of example implementations are included in this Repo.

<sub><sub>[Back to top](#contents)</sub></sub>


## Implementations
<!--The implementations must be completed before any EIP is given status "Final", but it need not be completed before the EIP is accepted. While there is merit to the approach of reaching consensus on the specification and rationale before writing code, the principle of "rough consensus and running code" is still useful when it comes to resolving many discussions of API details.-->
Detailed example implementations and Truffle tests of these example implementations are included in this Repo.

<sub><sub>[Back to top](#contents)</sub></sub>


## References

##### <a id="1"></a> Standards

1. <a id="1.1"></a> ERC-20 Token Standard. https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
1. <a id="1.2"></a> ERC-165 Standard Interface Detection. https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md
1. <a id="1.3"></a> ERC-173 Contract Ownership Standard. https://github.com/ethereum/EIPs/issues/173
1. <a id="1.4"></a> ERC-196 Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128. https://github.com/ethereum/EIPs/blob/master/EIPS/eip-196.md
1. <a id="1.5"></a> ERC-197 Precompiled contracts for optimal ate pairing check on the elliptic curve alt_bn128. https://github.com/ethereum/EIPs/blob/master/EIPS/eip-197.md
1. <a id="1.7"></a> Ethereum Name Service (ENS). https://ens.domains
1. <a id="1.8"></a> RFC 2119 Key words for use in RFCs to Indicate Requirement Levels. https://www.ietf.org/rfc/rfc2119.txt


##### <a id="2"></a> Issues

1. <a id="2.1"></a> Please refer to the [Github Repo](https://github.com/EYBlockchain/zksnark-verifier-standard/issues) for issues.

##### <a id="3"></a> Discussions

1. <a id="3.1"></a> Please refer to the [Github Repo](https://github.com/EYBlockchain/zksnark-verifier-standard/issues) for discussions.

##### <a id="4"></a> Educational material:  zk-SNARKs
1. <a id="4.1"></a> Zcash - What are zk-SNARKs? https://z.cash/technology/zksnarks.html
1. <a id="4.2"></a> Vitalik Buterin - zk-SNARKs - Under the Hood. https://medium.com/@VitalikButerin/zk-snarks-under-the-hood-b33151a013f6
1. <a id="4.3"></a> Christian Reitweissner - zk-SNARKs in a Nutshell. https://blog.ethereum.org/2016/12/05/zksnarks-in-a-nutshell/
1. <a id="4.4"></a> Succinct Non-Interactive Zero Knowledge for a von Neumann Architecture. https://eprint.iacr.org/2013/879.pdf

##### <a id="5"></a> Notable applications of zk-SNARKs
 1. <a id="5.1"></a> [EY](https://www.ey.com) - Implementation of a business agreement through Token Commitment transactions on the Ethereum mainnet - https://github.com/EYBlockchain/ZKPChallenge
 1. <a id="5.2"></a> Zcash - https://z.cash
 1. <a id="5.3"></a> Zcash - How Transactions Between Shielded Addresses Work. https://blog.z.cash/zcash-private-transactions/

##### <a id="6"></a> Notable projects relating to zk-SNARKs
  1. <a id="6.1"></a> libsnark - C++ Library for zk-SNARKs. https://github.com/SCIPR-Lab/libsnark
  1. <a id="6.2"></a> ZoKrates - Scalable Privacy-Preserving Off-Chain Computations. https://www.ise.tu-berlin.de/fileadmin/fg308/publications/2018/2018_eberhardt_ZoKrates.pdf
  1. <a id="6.3"></a> Jacob Eberhardt - ZoKrates Github Repo. https://github.com/JacobEberhardt/ZoKrates
  1. <a id="6.4"></a> Joseph Stockermans - zkSNARKs: Driver's Ed. https://github.com/jstoxrocky/zksnarks_example
  1. <a id="6.5"></a> Christian Reitweissner - snarktest.solidity. https://gist.github.com/chriseth/f9be9d9391efc5beb9704255a8e2989d

##### <a id="7"></a> Notable 'alternatives' to zk-SNARKs - areas of ongoing zero-knowledge proof research
  1. <a id="7.1"></a> STARKs - https://vitalik.ca/general/2017/11/09/starks_part_1.html
  1. <a id="7.2"></a> Bulletproofs - https://eprint.iacr.org/2017/1066.pdf
  1. <a id="7.3"></a> Range Proofs - https://www.cosic.esat.kuleuven.be/ecrypt/provpriv2012/abstracts/canard.pdf
  1. <a id="7.4"></a> Secure Enclaves - https://developer.apple.com/documentation/security/certificate_key_and_trust_services/keys/storing_keys_in_the_secure_enclave
  https://software.intel.com/en-us/sgx


<sub><sub>[Back to top](#contents)</sub></sub>


## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

<sub><sub>[Back to top](#contents)</sub></sub>
