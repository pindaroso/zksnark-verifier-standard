/**
@author MichaelConnorOfficial
*/

const encodeCall = require('./helpers/encodeCall')
const assertRevert = require('./helpers/assertRevert')
const utils = require('./utils.js')

const jsonfile = require('jsonfile');
const fs = require('fs');
const leftPad = require('left-pad');


const Verifier_Register_Library = artifacts.require('Verifier_Register_Library')
const Verifier_Registry = artifacts.require('Verifier_Registry')

const Points = artifacts.require('Points')
const Pairing_v0 = artifacts.require('Pairing_v0')
const PGHR13_lib_v0 = artifacts.require('PGHR13_lib_v0')
const PGHR13_v0 = artifacts.require('PGHR13_v0')


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const address1 = "0x1111111111111111111111111111111111111111"
const address2 = "0x2222222222222222222222222222222222222222"



contract('Verifier_Registry', ([_, registryOwner, verifierOwner, vkSubmitter, proofSubmitter, anotherAccount]) => {

  console.log("registryOwner", registryOwner)
  console.log("verifierOwner", verifierOwner)
  console.log("vkSubmitter", vkSubmitter)
  console.log("proofSubmitter", proofSubmitter)
  console.log("anotherAccount", anotherAccount)

  let verifier_register_library
  let verifier_registry

  let points
  let pairing_v0
  let pghr13_lib_v0
  let pghr13_v0

  let vk
  let vk2
  let vkId

  let proof
  let proof2
  let proofId

  let inputs

  //const initializeData = encodeCall('initialize', ['address'], [structOwner]);

  beforeEach(async function () {
    //deploy Verifier_Register_Library
    verifier_register_library = await Verifier_Register_Library.new({ from: anotherAccount })

    //deploy Verifier_Registry
    await Verifier_Registry.link("Verifier_Register_Library", verifier_register_library.address)
    verifier_registry = await Verifier_Registry.new()

    //deploy points library
    points = await Points.new()

    //deploy the Pairing_v0 library
    await Pairing_v0.link("Points", points.address)
    pairing_v0 = await Pairing_v0.new()

    //deploy PGHR13_lib_v0 library
    await PGHR13_lib_v0.link("Points", points.address)
    pghr13_lib_v0 = await PGHR13_lib_v0.new()

    //deploy PGHR13_v0
    await PGHR13_v0.link("PGHR13_lib_v0", pghr13_lib_v0.address)
    pghr13_v0 = await PGHR13_v0.new( verifier_registry.address )

    //for debugging deployments:


    //console.log("verifier_register_library address", verifier_register_library.address)
    //console.log("verifier_registry address", verifier_registry.address)
    /*
    console.log("points address", points.address)
    console.log("pairing_v0 address", pairing_v0.address)
    console.log("pghr13_lib_v0 address", pghr13_lib_v0.address)
    console.log("pghr13_v0 address", pghr13_v0.address)
    */



    //console.log("Reading vk from json file...")
    const VERIFYING_KEY_PGHR13_v0 = "./test/jsons/PGHR13-vk.json"
    vk = await new Promise((resolve, reject) => {
      jsonfile.readFile(VERIFYING_KEY_PGHR13_v0, (err, data) => {
        //jsonfile doesn't natively support promises
        if (err) reject(err)
        else resolve(data)
      })
    })
    vk = Object.values(vk)
    //convert to flattened array:
    vk = utils.flattenDeep(vk);
    //console.log("vk readfile check:")
    //console.log(vk)
    vk2 = vk.map(el => utils.hexToDec(el))
    //console.log("vk2")
    //console.log(vk2)
    vkId = web3.utils.soliditySha3(vk2[0], vk2[1], vk2[2], vk2[3], vk2[4], vk2[5], vk2[6], vk2[7], vk2[8], vk2[9], vk2[10], vk2[11], vk2[12], vk2[13], vk2[14], vk2[15], vk2[16], vk2[17], vk2[18], vk2[19], vk2[20], vk2[21], vk2[22], vk2[23], vk2[24], vk2[25], vk2[26], vk2[27], vk2[28], vk2[29], vk2[30], vk2[31])
    //console.log("vkId")
    //console.log(vkId)


    //console.log("Reading proof object from json file...")
    const PROOF_PGHR13_v0 = "./test/jsons/PGHR13-proof.json"
    proof = await new Promise((resolve, reject) => {
      jsonfile.readFile(PROOF_PGHR13_v0, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    //console.log("proof readfile check:", proof.A)
    proof = Object.values(proof)
    //convert to flattened array:
    proof = utils.flattenDeep(proof);
    //console.log("proof")
    //console.log(proof)
    proof2 = proof.map(el => utils.hexToDec(el))
    //console.log("proof2")
    //console.log(proof2)

    inputs = ['10000','8308427066351555919','1'];

    proofId = web3.utils.soliditySha3(proof2[0], proof2[1], proof2[2], proof2[3], proof2[4], proof2[5], proof2[6], proof2[7], proof2[8], proof2[9], proof2[10], proof2[11], proof2[12], proof2[13], proof2[14], proof2[15], proof2[16], proof2[17], inputs[0], inputs[1], inputs[2])
    //console.log("proofId")
    //console.log(proofId)

    //console.log("Reading vk from json file...")
    const FALSE_VERIFYING_KEY_PGHR13_v0 = "./test/jsons/PGHR13-false-vk.json"
    vk3 = await new Promise((resolve, reject) => {
      jsonfile.readFile(FALSE_VERIFYING_KEY_PGHR13_v0, (err, data) => {
        //jsonfile doesn't natively support promises
        if (err) reject(err)
        else resolve(data)
      })
    })
    vk3 = Object.values(vk3)
    //convert to flattened array:
    vk3 = utils.flattenDeep(vk3);
    //console.log("vk readfile check:")
    //console.log(vk)
    vk4 = vk3.map(el => utils.hexToDec(el))
    //console.log("vk2")
    //console.log(vk2)
    vkId2 = web3.utils.soliditySha3(vk4[0], vk4[1], vk4[2], vk4[3], vk4[4], vk4[5], vk4[6], vk4[7], vk4[8], vk4[9], vk4[10], vk4[11], vk4[12], vk4[13], vk4[14], vk4[15], vk4[16], vk4[17], vk4[18], vk4[19], vk4[20], vk4[21], vk4[22], vk4[23], vk4[24], vk4[25], vk4[26], vk4[27], vk4[28], vk4[29], vk4[30], vk4[31])
    //console.log("vkId")
    //console.log(vkId)


    //console.log("Reading proof object from json file...")
    const FALSE_PROOF_PGHR13_v0 = "./test/jsons/PGHR13-false-proof.json"
    proof3 = await new Promise((resolve, reject) => {
      jsonfile.readFile(FALSE_PROOF_PGHR13_v0, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    //console.log("proof readfile check:", proof.A)
    proof3 = Object.values(proof3)
    //convert to flattened array:
    proof3 = utils.flattenDeep(proof3);
    //console.log("proof")
    //console.log(proof)
    proof4 = proof3.map(el => utils.hexToDec(el))
    //console.log("proof2")
    //console.log(proof2)

    proofId2 = web3.utils.soliditySha3(proof4[0], proof4[1], proof4[2], proof4[3], proof4[4], proof4[5], proof4[6], proof4[7], proof4[8], proof4[9], proof4[10], proof4[11], proof4[12], proof4[13], proof4[14], proof4[15], proof4[16], proof4[17], inputs[0], inputs[1], inputs[2])
    //console.log("proofId")
    //console.log(proofId)



  })


  describe('registerVerifier()', function () {

    describe('when a new verifierContract is submitted for registration', function () {

      describe('if no verifierContract has ever been submitted before', function () {
        const from = verifierOwner;

        it('returns true', async function () {
          let result = await verifier_registry.registerVerifierContract.call(address1)
          assert.equal(result, true);          //only calls return values
        })

        it('emits NewVerifierContractRegistered event', async function () {
          const { logs } = await verifier_registry.registerVerifierContract(address1, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'NewVerifierContractRegistered')
          assert.equal(logs[0].args._contractAddress, address1)
        })

        it("loads the verifierContract's metadata into the Registers", async function () {
          await verifier_registry.registerVerifierContract(address1, { from })

          let _contractAddress = await verifier_registry.getVerifierContractAddress.call(address1)
          let _submitter = await verifier_registry.getVerifierContractEntrySubmitter.call(address1)
          let _owner = await verifier_registry.getVerifierContractEntryOwner.call(address1)

          assert.equal(_contractAddress, address1)
          assert.equal(_submitter, verifierOwner)
          assert.equal(_owner, verifierOwner)
        })
      })

      describe('if the verifierContract has been submitted before', function () {
        const from = verifierOwner;

        beforeEach(async function () {
          //register a verifierContract (with the intention of colliding with this when we try to re-register it)
          await verifier_registry.registerVerifierContract(address1, { from })
        })

        it('reverts', async function () {
          await assertRevert(verifier_registry.registerVerifierContract(address1, { from }))
        })

      })

      describe('if this verifierContract has not been submitted before', function () {
        const from = verifierOwner;

        beforeEach(async function () {
          await verifier_registry.registerVerifierContract(address1, { from })
        })

        it('returns true', async function () {
          let result = await verifier_registry.registerVerifierContract.call(address2)
          assert.equal(result, true);          //only calls return values
        })

        it('emits NewVerifierContractRegistered event', async function () {
          const { logs } = await verifier_registry.registerVerifierContract(address2, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'NewVerifierContractRegistered')
          assert.equal(logs[0].args._contractAddress, address2)
        })

        it("loads the verifierContract's metadata into the Registers", async function () {
          await verifier_registry.registerVerifierContract(address2, { from })

          let _contractAddress = await verifier_registry.getVerifierContractAddress.call(address2)
          let _submitter = await verifier_registry.getVerifierContractEntrySubmitter.call(address2)
          let _owner = await verifier_registry.getVerifierContractEntryOwner.call(address2)

          assert.equal(_contractAddress, address2)
          assert.equal(_submitter, verifierOwner)
          assert.equal(_owner, verifierOwner)
        })

        it("does not overwrite existing verifierContracts' metadata (which has been stored in the verifierContractRegister)", async function () {
          await verifier_registry.registerVerifierContract(address2, { from: anotherAccount })

          let _contractAddress1 = await verifier_registry.getVerifierContractAddress.call(address1)
          let _submitter1 = await verifier_registry.getVerifierContractEntrySubmitter.call(address1)
          let _owner1 = await verifier_registry.getVerifierContractEntryOwner.call(address1)

          let _contractAddress2 = await verifier_registry.getVerifierContractAddress.call(address2)
          let _submitter2 = await verifier_registry.getVerifierContractEntrySubmitter.call(address2)
          let _owner2 = await verifier_registry.getVerifierContractEntryOwner.call(address2)

          assert.equal(_contractAddress1, address1)
          assert.equal(_submitter1, verifierOwner)
          assert.equal(_owner1, verifierOwner)

          assert.equal(_contractAddress2, address2)
          assert.equal(_submitter2, anotherAccount)
          assert.equal(_owner2, anotherAccount)
        })

      })
    })
  })

  describe('createNewVkId()', function () {
    const from = vkSubmitter;

    it('returns a vkId', async function () {

      let _vkId = await verifier_registry.createNewVkId.call(vk, [address1], { from })

      assert.equal(_vkId, vkId);

    })

  })


  describe('registerVk()', function () {
    const from = vkSubmitter;

    describe('when the relevant verifierContracts have already been submitted', function () {

      beforeEach(async function () {
        await verifier_registry.registerVerifierContract(address1, { from: verifierOwner })
      })

      describe('when a new vk is submitted for registration against ONE verifierContract', function () {

        describe('if no vk has ever been submitted before', function () {

          it('returns a vkId', async function () {

            let _vkId = await verifier_registry.registerVk.call(vk2, [address1], { from })

            assert.equal(_vkId, vkId)
          })

          it('emits NewVkRegistered event', async function () {

            const { logs } = await verifier_registry.registerVk(vk2, [address1], { from })

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'NewVkRegistered')
            assert.equal(logs[0].args._vkId, vkId)
          })

          it("loads the vk's metadata into the vkRegister", async function () {

            let verifierContracts = [address1];

            await verifier_registry.registerVk(vk2, verifierContracts, { from })

            let _vkId = await verifier_registry.getVkEntryVkId.call(vkId)
            let _vk = await verifier_registry.getVkEntryVk.call(vkId)
            let _verifiers = await verifier_registry.getVkEntryVerifiers.call(vkId)
            let _submitter = await verifier_registry.getVkEntryVkSubmitter.call(vkId)

            assert.equal(_vkId, vkId)
            for (let i=0; i<vk2.length; i++) {
              assert.equal(_vk[i], vk2[i])
            }
            for (let i=0; i<verifierContracts.length; i++) {
              assert.equal(_verifiers[i], verifierContracts[i])
            }
            assert.equal(_submitter, from)

          })

          it("loads the vk's metadata into the verifierContractRegister", async function () {

            let verifierContracts = [address1];

            await verifier_registry.registerVk(vk2, verifierContracts, { from })

            let _vkIds = await verifier_registry.getVerifierContractEntryVkIds.call(address2)

            for (let i=0; i<_vkIds.length; i++) {
              assert.equal(_vkIds[i], vkId) //we don't have multiple vkIds to compare against in this test code yet!
            }

          })

          it("correctly stores the vk, and returns it when called", async function () {

            let verifierContracts = [address1];

            await verifier_registry.registerVk(vk2, verifierContracts, { from })

            let _vk = await verifier_registry.getVk.call(vkId)

            for (let i=0; i<vk2.length; i++) {
              assert.equal(_vk[i], vk2[i])
            }

          })

        })

        describe('if a different vk has been submitted previously', function () {

        })

        describe('if this same vk has already been submitted previously', function () {

        })

      })

      describe('when a new vk is submitted for registration against MULTIPLE verifierContracts', function () {

        beforeEach(async function () {
          await verifier_registry.registerVerifierContract(address2, { from: verifierOwner })
        })

        it('returns a vkId', async function () {
          let verifierContracts = [address1, address2];

          let _vkId = await verifier_registry.registerVk.call(vk2, verifierContracts, { from })

          assert.equal(_vkId, vkId)
        })

        it('emits NewVkRegistered event', async function () {
          let verifierContracts = [address1, address2];

          const { logs } = await verifier_registry.registerVk(vk2, verifierContracts, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'NewVkRegistered')
          assert.equal(logs[0].args._vkId, vkId)
        })

        it("loads the vk's metadata into the vkRegister", async function () {

          let verifierContracts = [address1, address2];

          await verifier_registry.registerVk(vk2, verifierContracts, { from })

          let _vkId = await verifier_registry.getVkEntryVkId.call(vkId)
          let _vk = await verifier_registry.getVkEntryVk.call(vkId)
          let _verifiers = await verifier_registry.getVkEntryVerifiers.call(vkId)
          let _submitter = await verifier_registry.getVkEntryVkSubmitter.call(vkId)

          assert.equal(_vkId, vkId)
          for (let i=0; i<vk2.length; i++) {
            assert.equal(_vk[i], vk2[i])
          }
          for (let i=0; i<verifierContracts.length; i++) {
            assert.equal(_verifiers[i], verifierContracts[i])
          }
          assert.equal(_submitter, from)

        })

        it("loads the vk's metadata into MULTIPLE verifierContractRegisters", async function () {

          let verifierContracts = [address1, address2];

          await verifier_registry.registerVk(vk2, verifierContracts, { from })

          let _vkIds = await verifier_registry.getVerifierContractEntryVkIds.call(address1)

          for (let i=0; i<_vkIds.length; i++) {
            assert.equal(_vkIds[i], vkId) //we don't have multiple vkIds to compare against in this test code yet!
          }

          _vkIds = await verifier_registry.getVerifierContractEntryVkIds.call(address2)

          for (let i=0; i<_vkIds.length; i++) {
            assert.equal(_vkIds[i], vkId) //we don't have multiple vkIds to compare against in this test code yet!
          }

        })

        it("correctly stores the vk, and returns it when called", async function () {

          let verifierContracts = [address2];

          await verifier_registry.registerVk(vk2, verifierContracts, { from })

          let _vk = await verifier_registry.getVk.call(vkId)

          for (let i=0; i<vk2.length; i++) {
            assert.equal(_vk[i], vk2[i])
          }

        })

      })

    })

    describe('when the relevant verifierContracts have NOT already been submitted', function () {

      describe('when a new vk is submitted for registration against ONE verifierContract', function () {

        it('reverts', async function () {

          let verifierContracts = [address1];

          await assertRevert(verifier_registry.registerVk(vk2, verifierContracts, { from }))
        })

      })

      describe('when a new vk is submitted for registration against MULTIPLE verifierContracts', function () {

        it('reverts', async function () {

          let verifierContracts = [address1, address2];

          await assertRevert(verifier_registry.registerVk(vk2, verifierContracts, { from }))
        })

      })

    })

  })


  describe('createNewProofId()', function () {
    const from = proofSubmitter;

    it('returns a proofId', async function () {

      let _proofId = await verifier_registry.createNewProofId.call(proof2, inputs, { from })

      assert.equal(_proofId, proofId);

    })

  })


  describe('submitProof() OVERLOADED with a specified verifierContract', function () {

    describe('when the relevant verifierContract has already been submitted', function () {

      beforeEach(async function () {
        await verifier_registry.registerVerifierContract(address1, { from: verifierOwner })
      })

      describe('when the relevant vk has already been submitted', function () {

        beforeEach(async function () {
          await verifier_registry.registerVk(vk2, [address1], { from: vkSubmitter })
        })

        describe('when a NEW proof is submitted against the vk and verifierContract', function () {

          it('returns a proofId', async function () {

            let _proofId = await verifier_registry.submitProof.call(proof2, inputs, vkId, address1, { from: proofSubmitter })

            assert.equal(_proofId, proofId)
          })

          it('emits NewProofSubmitted event', async function () {

            const { logs } = await verifier_registry.methods['submitProof(uint256[],uint256[],bytes32,address)'](proof2, inputs, vkId, address1, { from: proofSubmitter })

            //console.log(logs[0])

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'NewProofSubmitted')
            assert.equal(logs[0].args._proofId, proofId)

            for (let i=0; i<proof2.length; i++) {
              assert.equal(logs[0].args._proof[i], proof2[i])
            }
            for (let i=0; i<inputs.length; i++) {
              assert.equal(logs[0].args._inputs[i], inputs[i])
            }

          })

          it("loads the proof's metadata into the proofRegister", async function () {

            await verifier_registry.methods['submitProof(uint256[],uint256[],bytes32,address)'](proof2, inputs, vkId, address1, { from: proofSubmitter })

            let _proofId = await verifier_registry.getProofEntryProofId.call(proofId)
            let _vkIds = await verifier_registry.getProofEntryVkIds.call(proofId)
            let _verifiers = await verifier_registry.getProofEntryVerifiers.call(proofId)
            let _submitters = await verifier_registry.getProofEntryProofSubmitters.call(proofId)

            assert.equal(_proofId, proofId)
            for (let i=0; i<1; i++) {
              assert.equal(_vkIds[i], vkId) //we only have one vk in this test so far...
            }
            for (let i=0; i<1; i++) {
              assert.equal(_verifiers[i], address1) //we only have one verifierContract in this test so far...
            }
            for (let i=0; i<1; i++) {
              assert.equal(_submitters[i], proofSubmitter) //we only have one proofSubmitter in this test so far...
            }

          })

          it("loads the proof's metadata into the vkRegister", async function () {

            await verifier_registry.methods['submitProof(uint256[],uint256[],bytes32,address)'](proof2, inputs, vkId, address1, { from: proofSubmitter })
            let _proofId
            let _proofIds = await verifier_registry.getVkEntryProofIds.call(vkId)

            for (let i = 0; i<_proofIds.length; i++) {
              if(_proofIds[i] == proofId) {
                _proofId= _proofIds[i] //find the proofId in the returned array of proofIds (to ensure it's been pushed correctly)
              }
            }
            assert.equal(_proofId, proofId)

          })

          it("loads the proof's metadata into the verifierContractRegister", async function () {

            await verifier_registry.methods['submitProof(uint256[],uint256[],bytes32,address)'](proof2, inputs, vkId, address1, { from: proofSubmitter })
            let _proofId
            let _proofIds = await verifier_registry.getVerifierContractEntryProofIds.call(address1)

            for (let i = 0; i<_proofIds.length; i++) {
              if(_proofIds[i] == proofId) {
                _proofId = _proofIds[i] //find the proofId in the returned array of proofIds (to ensure it's been pushed correctly)
              }
            }
            assert.equal(_proofId, proofId)

          })

        })

        describe('when a NEW proof is submitted against the vk BUT an UNREGISTERED verifierContract', function () {

          it('reverts', async function () {

            //address2 is not registered - address1 is

            await assertRevert(verifier_registry.methods['submitProof(uint256[],uint256[],bytes32,address)'](proof2, inputs, vkId, address2, { from: proofSubmitter }))

          })

        })

        describe('when a NEW proof is submitted against an UNREGISTERED vk BUT a registered verifierContract', function () {

          it('reverts', async function () {

            //0x4c77da1f7262307c153866733748a1a8e45b812d14b7e62ce15ecd14237ac801 is not a registered vkId - (it differs from the 'correct' vkId by 1)

            await assertRevert(verifier_registry.methods['submitProof(uint256[],uint256[],bytes32,address)'](proof2, inputs, '0x4c77da1f7262307c153866733748a1a8e45b812d14b7e62ce15ecd14237ac801', address1, { from: proofSubmitter }))

          })

        })
      })
    })
  })


  describe('submitProof() NOT OVERLOADED with a specified verifierContract', function () {

    describe('when the relevant verifierContract has already been submitted', function () {

      beforeEach(async function () {
        await verifier_registry.registerVerifierContract(address1, { from: verifierOwner })
      })

      describe('when the relevant vk has already been submitted', function () {

        beforeEach(async function () {
          await verifier_registry.registerVk(vk2, [address1], { from: vkSubmitter })
        })

        describe('when a NEW proof is submitted against the vk', function () {

          it('returns a proofId', async function () {

            let _proofId = await verifier_registry.submitProof.call(proof2, inputs, vkId, { from: proofSubmitter })

            assert.equal(_proofId, proofId)
          })

          it('emits NewProofSubmitted event', async function () {


            //Truffle struggles with overloaded functions - this is how we do it:
            const { logs } = await verifier_registry.methods['submitProof(uint256[],uint256[],bytes32)'](proof2, inputs, vkId, { from: proofSubmitter })

            //console.log(logs[0])

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'NewProofSubmitted')
            assert.equal(logs[0].args._proofId, proofId)

            for (let i=0; i<proof2.length; i++) {
              assert.equal(logs[0].args._proof[i], proof2[i])
            }
            for (let i=0; i<inputs.length; i++) {
              assert.equal(logs[0].args._inputs[i], inputs[i])
            }

          })

          it("loads the proof's metadata into the proofRegister", async function () {

            await verifier_registry.methods['submitProof(uint256[],uint256[],bytes32)'](proof2, inputs, vkId, { from: proofSubmitter })

            let _proofId = await verifier_registry.getProofEntryProofId.call(proofId)
            let _vkIds = await verifier_registry.getProofEntryVkIds.call(proofId)
            let _submitters = await verifier_registry.getProofEntryProofSubmitters.call(proofId)

            assert.equal(_proofId, proofId)
            for (let i=0; i<1; i++) {
              assert.equal(_vkIds[i], vkId) //we only have one vk in this test so far...
            }
            for (let i=0; i<1; i++) {
              assert.equal(_submitters[i], proofSubmitter) //we only have one proofSubmitter in this test so far...
            }

          })

          it("loads the proof's metadata into the vkRegister", async function () {

            await verifier_registry.methods['submitProof(uint256[],uint256[],bytes32)'](proof2, inputs, vkId, { from: proofSubmitter })
            let _proofId
            let _proofIds = await verifier_registry.getVkEntryProofIds.call(vkId)

            for (let i = 0; i<_proofIds.length; i++) {
              if(_proofIds[i] == proofId) {
                _proofId= _proofIds[i] //find the proofId in the returned array of proofIds (to ensure it's been pushed correctly)
              }
            }
            assert.equal(_proofId, proofId)

          })

        })

        describe('when a NEW proof is submitted against an UNREGISTERED vk', function () {

          it('reverts', async function () {

            //0x4c77da1f7262307c153866733748a1a8e45b812d14b7e62ce15ecd14237ac801 is not a registered vkId - (it differs from the 'correct' vkId by 1)

            await assertRevert(verifier_registry.methods['submitProof(uint256[],uint256[],bytes32)'](proof2, inputs, '0x4c77da1f7262307c153866733748a1a8e45b812d14b7e62ce15ecd14237ac801', { from: proofSubmitter }))

          })

        })
      })
    })
  })


  describe('attestProof()', function () {

    describe('when the relevant verifierContract has already been submitted', function () {

      beforeEach(async function () {
        await verifier_registry.registerVerifierContract(address1, { from: verifierOwner })
      })

      describe('when the relevant vk has already been submitted', function () {

        beforeEach(async function () {
          await verifier_registry.registerVk(vk2, [address1], { from: vkSubmitter })
        })

        describe('when the relevant proof has already been submitted against the vk', function () {

          beforeEach(async function () {
            await verifier_registry.methods['submitProof(uint256[],uint256[],bytes32)'](proof2, inputs, vkId, { from: proofSubmitter })
          })

          describe('when a verifier attests to the proof being TRUE', function () {

            it("loads the proof's metadata into the proofRegister", async function () {

              await verifier_registry.attestProof(proofId, vkId, true, { from: anotherAccount })

              let _result = await verifier_registry.getProofEntryResult.call(proofId, anotherAccount)

              let _verifierCaller = await verifier_registry.getProofEntryVerifierCaller.call(proofId, anotherAccount)

              assert.equal(_result, true)
              assert.equal(_verifierCaller, anotherAccount) //we only have one verifierCaller in this test so far...

            })

          })

          describe('when a verifier attests to the proof being FALSE', function () {

            it("loads the proof's metadata into the proofRegister", async function () {

              await verifier_registry.attestProof(proofId, vkId, false, { from: anotherAccount })

              let _result = await verifier_registry.getProofEntryResult.call(proofId, anotherAccount)
              let _verifierCaller = await verifier_registry.getProofEntryVerifierCaller.call(proofId, anotherAccount)

              assert.equal(_result, false)
              assert.equal(_verifierCaller, anotherAccount) //we only have one verifierCaller in this test so far...

            })

          })

          describe('when a verifier attests to an UNREGISTERED proof', function () {

            it('reverts', async function () {

              await assertRevert(verifier_registry.attestProof('0x4c77da1f7262307c153866733748a1a8e45b812d14b7e62ce15ecd14237ac801', vkId, true, { from: anotherAccount }))

            })

          })

          describe('when a verifier attests to an UNREGISTERED vk', function () {

            it('reverts', async function () {

              await assertRevert(verifier_registry.attestProof(proofId, '0x4c77da1f7262307c153866733748a1a8e45b812d14b7e62ce15ecd14237ac801', true, { from: anotherAccount }))

            })
          })
        })
      })
    })
  })


  describe('submitProofAndVerify()', function () {

    describe('when the relevant verifierContract has already been submitted', function () {

      beforeEach(async function () {
        await verifier_registry.registerVerifierContract(address1, { from: verifierOwner })
      })

      describe('when the relevant vk has already been submitted', function () {

        beforeEach(async function () {
          await verifier_registry.registerVk(vk2, [address1], { from: vkSubmitter })
        })

        describe('when a NEW and TRUE proof is submitted against the vk and verifierContract', function () {

          it('returns a proofId and TRUE result', async function () {

            let _results = await verifier_registry.submitProofAndVerify.call(proof2, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            //console.log(_results)

            assert.equal(_results.proofId, proofId)
            assert.equal(_results.result, true)
          })

          it('emits NewProofSubmitted event', async function () {

            const { logs } = await verifier_registry.submitProofAndVerify(proof2, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            //console.log(logs[0])

            assert.equal(logs.length, 2)
            assert.equal(logs[0].event, 'NewProofSubmitted')
            assert.equal(logs[0].args._proofId, proofId)

            for (let i=0; i<proof2.length; i++) {
              assert.equal(logs[0].args._proof[i], proof2[i])
            }
            for (let i=0; i<inputs.length; i++) {
              assert.equal(logs[0].args._inputs[i], inputs[i])
            }

          })

          it('emits NewAttestation event', async function () {

            const { logs } = await verifier_registry.submitProofAndVerify(proof2, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            //console.log(logs[0])

            assert.equal(logs.length, 2)
            assert.equal(logs[1].event, 'NewAttestation')
            assert.equal(logs[1].args._proofId, proofId)
            assert.equal(logs[1].args._verifier, pghr13_v0.address)
            assert.equal(logs[1].args._result, true)

          })

          it("loads the proof's metadata into the proofRegister", async function () {

            await verifier_registry.submitProofAndVerify(proof2, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            let _proofId = await verifier_registry.getProofEntryProofId.call(proofId)
            let _vkIds = await verifier_registry.getProofEntryVkIds.call(proofId)
            let _verifiers = await verifier_registry.getProofEntryVerifiers.call(proofId)
            let _submitters = await verifier_registry.getProofEntryProofSubmitters.call(proofId)

            let _result = await verifier_registry.getProofEntryResult.call(proofId, pghr13_v0.address)
            let _verifierCaller = await verifier_registry.getProofEntryVerifierCaller.call(proofId, proofSubmitter)

            assert.equal(_proofId, proofId)
            for (let i=0; i<1; i++) {
              assert.equal(_vkIds[i], vkId) //we only have one vk in this test so far...
            }
            for (let i=0; i<1; i++) {
              assert.equal(_verifiers[i], pghr13_v0.address) //we only have one verifierContract in this test so far...
            }
            for (let i=0; i<1; i++) {
              assert.equal(_submitters[i], proofSubmitter) //we only have one proofSubmitter in this test so far...
            }

            assert.equal(_result, true)
            assert.equal(_verifierCaller, proofSubmitter)

          })

          it("loads the proof's metadata into the vkRegister", async function () {

            await verifier_registry.submitProofAndVerify(proof2, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            let _proofId

            let _proofIds = await verifier_registry.getVkEntryProofIds.call(vkId)

            for (let i = 0; i<_proofIds.length; i++) {
              if(_proofIds[i] == proofId) {
                _proofId= _proofIds[i] //find the proofId in the returned array of proofIds (to ensure it's been pushed correctly)
              }
            }
            assert.equal(_proofId, proofId)

          })

          it("loads the proof's metadata into the verifierContractRegister", async function () {

            await verifier_registry.submitProofAndVerify(proof2, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            let _proofId
            let _proofIds = await verifier_registry.getVerifierContractEntryProofIds.call(pghr13_v0.address)

            for (let i = 0; i<_proofIds.length; i++) {
              if(_proofIds[i] == proofId) {
                _proofId = _proofIds[i] //find the proofId in the returned array of proofIds (to ensure it's been pushed correctly)
              }
            }
            assert.equal(_proofId, proofId)

          })

        })



        describe('when a NEW and FALSE proof is submitted against the vk and verifierContract', function () {

          it('returns a proofId and FALSE result', async function () {

            let _results = await verifier_registry.submitProofAndVerify.call(proof4, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            //console.log(_results)

            assert.equal(_results.proofId, proofId2)
            assert.equal(_results.result, false)
          })

          it('emits NewProofSubmitted event', async function () {

            const { logs } = await verifier_registry.submitProofAndVerify(proof4, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            //console.log(logs[0])

            assert.equal(logs.length, 2)
            assert.equal(logs[0].event, 'NewProofSubmitted')
            assert.equal(logs[0].args._proofId, proofId2)

            for (let i=0; i<proof2.length; i++) {
              assert.equal(logs[0].args._proof[i], proof4[i])
            }
            for (let i=0; i<inputs.length; i++) {
              assert.equal(logs[0].args._inputs[i], inputs[i])
            }

          })

          it('emits NewAttestation event', async function () {

            const { logs } = await verifier_registry.submitProofAndVerify(proof4, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            //console.log(logs[0])

            assert.equal(logs.length, 2)
            assert.equal(logs[1].event, 'NewAttestation')
            assert.equal(logs[1].args._proofId, proofId2)
            assert.equal(logs[1].args._verifier, pghr13_v0.address)
            assert.equal(logs[1].args._result, false)

          })

          it("loads the proof's metadata into the proofRegister", async function () {

            await verifier_registry.submitProofAndVerify(proof4, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            let _proofId = await verifier_registry.getProofEntryProofId.call(proofId2)
            let _vkIds = await verifier_registry.getProofEntryVkIds.call(proofId2)
            let _verifiers = await verifier_registry.getProofEntryVerifiers.call(proofId2)
            let _submitters = await verifier_registry.getProofEntryProofSubmitters.call(proofId2)

            let _result = await verifier_registry.getProofEntryResult.call(proofId2, pghr13_v0.address)
            let _verifierCaller = await verifier_registry.getProofEntryVerifierCaller.call(proofId2, proofSubmitter)

            assert.equal(_proofId, proofId2)
            for (let i=0; i<1; i++) {
              assert.equal(_vkIds[i], vkId) //we only have one vk in this test so far...
            }
            for (let i=0; i<1; i++) {
              assert.equal(_verifiers[i], pghr13_v0.address) //we only have one verifierContract in this test so far...
            }
            for (let i=0; i<1; i++) {
              assert.equal(_submitters[i], proofSubmitter) //we only have one proofSubmitter in this test so far...
            }

            assert.equal(_result, false)
            assert.equal(_verifierCaller, proofSubmitter)

          })

          it("loads the proof's metadata into the vkRegister", async function () {

            await verifier_registry.submitProofAndVerify(proof4, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            let _proofId

            let _proofIds = await verifier_registry.getVkEntryProofIds.call(vkId)

            for (let i = 0; i<_proofIds.length; i++) {
              if(_proofIds[i] == proofId2) {
                _proofId= _proofIds[i] //find the proofId in the returned array of proofIds (to ensure it's been pushed correctly)
              }
            }
            assert.equal(_proofId, proofId2)

          })

          it("loads the proof's metadata into the verifierContractRegister", async function () {

            await verifier_registry.submitProofAndVerify(proof4, inputs, vkId, pghr13_v0.address, { from: proofSubmitter })

            let _proofId
            let _proofIds = await verifier_registry.getVerifierContractEntryProofIds.call(pghr13_v0.address)

            for (let i = 0; i<_proofIds.length; i++) {
              if(_proofIds[i] == proofId2) {
                _proofId = _proofIds[i] //find the proofId in the returned array of proofIds (to ensure it's been pushed correctly)
              }
            }
            assert.equal(_proofId, proofId2)

          })

        })



        describe('when a NEW proof is submitted against the vk BUT an UNREGISTERED verifierContract', function () {

          it('reverts', async function () {

            //address2 is not registered - address1 is

            await assertRevert(verifier_registry.submitProofAndVerify(proof2, inputs, vkId, address2, { from: proofSubmitter }))

          })

        })

        describe('when a NEW proof is submitted against an UNREGISTERED vk BUT a registered verifierContract', function () {

          it('reverts', async function () {

            //0x4c77da1f7262307c153866733748a1a8e45b812d14b7e62ce15ecd14237ac801 is not a registered vkId - (it differs from the 'correct' vkId by 1)

            await assertRevert(verifier_registry.submitProofAndVerify(proof2, inputs, '0x4c77da1f7262307c153866733748a1a8e45b812d14b7e62ce15ecd14237ac801', pghr13_v0.address, { from: proofSubmitter }))

          })

        })
      })
    })
  })
})
