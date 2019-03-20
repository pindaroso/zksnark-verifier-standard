---
eip: To be assigned
title: zk-SNARK Verifier Standard
author: Michael Connor <michael.connor@uk.ey.com>, Chaitanya Konda <chaitanya.konda@uk.ey.com>, Duncan Westland <duncan.westland@uk.ey.com>
discussions-to: EY <https://github.com/EYBlockchain/zksnark-verifier-standard>
type: Standards Track
category: ERC
status: Draft
created: 2018-09-14
requires: 165, 196, 197
---

## Simple Summary

A standard interface for "Verifier" contracts which verify zk-SNARKs.

## Abstract
The following standard allows for the implementation of a standard contract API for the verification of zk-SNARKs ("Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge"), also known as "proofs", "arguments", or "commitments".

This standard provides basic functionality to load all necessary parameters for the verification of any zk-SNARK into a verifier contract, so that the proof may ultimately return a `true` or `false` response; corresponding to whether it has been verified or not verified.

## Motivation
zk-SNARKs are a promising area of interest for the Ethereum community. Key applications of zk-SNARKs include:
- Private transactions
- Private computations
- Improved transaction scaling through proofs of "bundled" transactions

A standard interface for verifying all zk-SNARKs will allow applications to more easily implement private transactions, private contracts, and scaling solutions; and to extract and interpret the limited information which gets emitted during zk-SNARK verifications.

This standard was initially proposed by [EY](https://www.ey.com), and was inspired in particular by the requirements of businesses wishing to keep their agreements, transactions, and supply chain activities confidential - all whilst still benefiting from the commonly cited strengths of blockchains and smart contracts.

## Specification
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

Common terminology is used in the specification below. The terminology is consistent with XXXSPECIFIC_REFERENCEXXX
* Adhering Contract: A Verifier contract which adheres to this specification.
* Arithmetic circuit: An abstraction of logical statements into addition and multiplication gates.
* Public Inputs: often denoted as a vector 'x' in zk-SNARKs literature, and denoted `inputs` in this interface. An arithmetic circuit can be thought of as taking two parameters; the Public Inputs, 'x', and a secret 'witness', 'w'. This interface standardises functions which can load the `inputs` into an Adhering Contract.
* Proof: A 'prover' who wants to 'prove' knowledge of some secret witness 'w' (which satisfies an arithmetic circuit), generates a `proof` from: the circuit's Proving Key; their secret witness 'w'; and its corresponding Public Inputs 'x'. Together, a pair `(proof, inputs)` of satisfying `inputs` and their corresponding `proof` forms a zk-snark.
* Verifying Key: A 'trusted setup' calculation creates both a public 'Proving Key' and a public 'Verifying Key' from an arithmetic circuit. This interface does not provide a method for loading a Verifying Key onto the blockchain. An Adhering Contract SHALL be able to accept arguments of knowledge (`(proof, inputs)` pairs) for at least one Verifying Key. We shall call such Verifying Keys 'in-scope' Verifying Keys. An Adhering Contract MUST be able to interpret unambiguously a unique `verifyingKeyId` for each of its 'in-scope' Verifying Keys.

**Every ERC-XXXX compliant verifier contract must implement the `ERCXXXX` and `ERC165` interfaces** (subject to "caveats" below):


```solidity
pragma solidity ^0.5.2;

/// @title EIP-XXXX zk-SNARK Verifier Standard
/// @dev See https://github.com/EYBlockchain/zksnark-verifier-standard
///  Note: the ERC-165 identifier for this interface is 0xXXXXXXXX.
interface EIPXXXX /* is ERC165 */ {

    // EVENTS //////////////////////////////////////////////////////////////////

    /// No events are specified.

    // FUNCTIONS ///////////////////////////////////////////////////////////////

    /// @notice Checks the arguments of Proof, through elliptic curve
    ///  pairing functions.
    /// @dev
    ///  MUST return `true` if Proof passes all checks (i.e. the Proof is
    ///  valid). MUST emit the Verified event in this case.
    ///  MUST return `false` if the Proof does not pass all checks (i.e. if the
    ///  Proof is invalid). MUST emit the NotVerified event in this case.
    /// @param proof A zk-SNARK.
    /// @param inputs Public inputs which accompany Proof.
    /// @param verifyingKeyId A unique identifier (known to this verifier
    ///  contract) for the Verifying Key to which Proof corresponds.
    /// @return result The result of the verification calculation. True
    ///  if Proof is valid; false otherwise.
    function verify(uint256[] calldata proof, uint256[] calldata inputs, bytes32 verifyingKeyId) external returns (bool result);

    /// @notice Checks the arguments of Proof, through elliptic curve
    ///  pairing functions.
    /// @dev
    ///  MUST return `true` if Proof passes all checks (i.e. the Proof is
    ///  valid). MUST emit the Verified event in this case.
    ///  MUST return `false` if the Proof does not pass all checks (i.e. if the
    ///  Proof is invalid). MUST emit the NotVerified event in this case.
    /// @param proof A zk-SNARK.
    /// @param inputs Public inputs which accompany Proof.
    /// @param verifyingKeyId A unique identifier (known to this verifier
    ///  contract) for the Verifying Key to which Proof corresponds.
    /// @return result The result of the verification calculation. True
    ///  if Proof is valid; false otherwise.
    function verifyFromRegistry(uint256[] calldata proof, uint256[] calldata inputs, bytes32 verifyingKeyId) external returns (bool result);
}
```
### Interface
``` solidity
interface ERC165 {
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

$C$ - A satisfiable arithmetic circuit abstraction of logical statements.

$\lambda$ - A random number, generated at the 'setup' phase - commonly referred to as 'toxic waste', because knowledge of $\lambda$ would allow an untrustworthy party to create 'false' proofs which would verify as 'true'. $\lambda$ must be destroyed.

$pk$ - The proving key for a particular circuit $C$.

$vk$ - The verifying key for a particular circuit $C$.

Both $pk$ and $vk$ are generated as a pair by some function $G$:
$$(pk, vk) = G(\lambda, C)$$

Note: $C$ can be represented unambiguously by either of $pk$ or $vk$. In zk-SNARK constructions, $vk$ is much smaller in size than $pk$, so as to enable succinct verification on-chain. Hence, $vk$ is the representative of $C$ that is 'known' to the contract. Therefore, we can identify each circuit uniquely through some `verifyingKeyId`, where `verifyingKeyId` serves as a more succinct mapping to $vk$.

$w$ - A 'private witness' string. A private argument to the circuit $C$ known only to the prover, which, when combined with the `inputs` argument $x$, comprises an argument of knowledge which satisfies the circuit $C$.

$x$ or `inputs` - A vector of 'Public Inputs'. A public argument to the circuit $C$ which, when combined with the private witness string $w$, comprises an argument of knowledge which satisfies the circuit $C$.

$\pi$ or `proof` - an encoded vector of values which represents the 'prover's' 'argument of knowledge' of values $w$ and $x$ which satisfy the circuit $C$.
$$\pi = P(pk, x, w)$$.

The ultimate purpose of a Verifier contract, as specified in this EIP, is to verify a proof (of the form $\pi​$) through some verification function $V​$.

$$V(vk, x, \pi)=\begin{cases}
    1, & \text{if $\exists w\ s.t.\ C(x,w)=1$}.\\
    0, & \text{otherwise}.
  \end{cases}​$$
The `verify()` function of this specification serves the purpose of $V​$; returning either `true` (the proof has been verified to satisfy the arithmetic circuit) or `false` (the proof has not been verified).


## Backwards Compatibility
- At the time this EIP was first proposed, there was only one known and working set of Verifier contracts for zk-SNARKs on the Ethereum mainnet - deployed by [EY](https://www.ey.com).
[EY's](https://www.ey.com) initial [implementation](#implementations) does not exactly adhere to the draft specification of this EIP, but EY have agreed that there is no need to provide backwards compatibility with their initial implementation.

- Dr Christian Reitwiessner's excellent [example](#6.5) of a Verifier contract and elliptic curve pairing library has been instrumental in the Ethereum community's experimentation and development of zk-SNARK protocols. Many of the naming conventions of this EIP have been kept consistent with his example.

- Existing zk-SNARK compilers such as [ZoKrates](#6.3), which produce 'Verifier.sol' contracts, do not currently produce Verifier contracts which adhere to this EIP specification.


## Test Cases
<!--Test cases for an implementation are mandatory for EIPs that are affecting consensus changes. Other EIPs can choose to include links to test cases if applicable.-->

Truffle tests of example implementations are included in the test case repository.


## Implementations
<!--The implementations must be completed before any EIP is given status "Final", but it need not be completed before the EIP is accepted. While there is merit to the approach of reaching consensus on the specification and rationale before writing code, the principle of "rough consensus and running code" is still useful when it comes to resolving many discussions of API details.-->
Detailed example implementations and Truffle tests of these example implementations are included in this repository.


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


## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
