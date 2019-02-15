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



contract('Verifier', ([_, registryOwner, verifierOwner, vkSubmitter, proofSubmitter, anotherAccount]) => {

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
    //
    //console.log("verifier_registry address", verifier_registry.address)
    /*
    console.log("points address", points.address)
    console.log("pairing_v0 address", pairing_v0.address)
    console.log("pghr13_lib_v0 address", pghr13_lib_v0.address)
    console.log("pghr13_v0 address", pghr13_v0.address)
    */



    //console.log("Reading vk from json file...")
    const VERIFYING_KEY_PGHR13_v0 = "./test/PGHR13-vk.json"
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
    const PROOF_PGHR13_v0 = "./test/PGHR13-proof.json"
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
    const FALSE_VERIFYING_KEY_PGHR13_v0 = "./test/PGHR13-false-vk.json"
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
    const FALSE_PROOF_PGHR13_v0 = "./test/PGHR13-false-proof.json"
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

  describe('constructor()', function () {

    it("stores the verifier's address in the verifier_registry", async function () {

      let _verifier = await verifier_registry.getVerifierContractAddress.call(pghr13_v0.address)
      assert.equal(_verifier, pghr13_v0.address)
    })

    it("stores the verifier registry's address in this (the verifier)", async function () {

      let _registry = await pghr13_v0.R.call()

      assert.equal(_registry, verifier_registry.address)
    })

  })


  describe('loadVk()', function () {

    it("stores the vk in the verifier_registry", async function () {

      await pghr13_v0.loadVk(vk2, {from: vkSubmitter})

      let _vk = await verifier_registry.getVk(vkId)
      //console.log(_vk)
      for (let i=0; i<vk2.length; i++) {
        assert.equal(_vk[i], vk2[i])
      }
    })

    it('emits NewVkLoaded event', async function () {

      const { logs } = await pghr13_v0.loadVk(vk2, {from: vkSubmitter})
      //console.log(logs)
      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'NewVkLoaded')
      assert.equal(logs[0].args._vkId, vkId)
    })

  })


  describe('verificationCalculation()', function () {

    beforeEach(async function () {
      await pghr13_v0.loadVk(vk2, {from: vkSubmitter})
    })

    it("evaluates a TRUE proof as true", async function () {
      //let _registry = await pghr13_v0.R.call()
      //console.log(_registry)

      let _result = await pghr13_v0.verificationCalculation.call(proof2, inputs, vkId, {from: proofSubmitter})

      assert.equal(_result, 0)

    })
/*
    it("evaluates a FALSE proof as false", async function () {

      let _result = await pghr13_v0.verificationCalculation.call(proof2, inputs, vkId, {from: proofSubmitter})
      console.log(_result)

      assert.notEqual(_result, 0)

    })
*/


    it('evaluates a FALSE proof as false', async function () {

      let _result = await pghr13_v0.verificationCalculation.call(proof4, inputs, vkId, {from: proofSubmitter})
      console.log('_result')
      console.log(_result)
      assert.notEqual(_result, 0)
    })

  })


  describe('verify() (OVERLOADED - plain evaluation - does not try to update the registry)', function () {

    beforeEach(async function () {
      await pghr13_v0.loadVk(vk2, {from: vkSubmitter})
    })

    it("stores the verifier's address in the verifier_registry", async function () {

      let _verifier = await verifier_registry.getVerifierContractAddress(pghr13_v0.address)
      assert.equal(_verifier, pghr13_v0.address)
    })

    it("evaluates a TRUE proof as true", async function () {
      //let _registry = await pghr13_v0.R.call()
      //console.log(_registry)

      let _result = await pghr13_v0.methods['verify(uint256[],uint64[],bytes32,bytes32)'].call(proof2, inputs, vkId, proofId, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(_result, true)

    })

    it("emits a Verified event when a TRUE proof is submitted", async function () {

      const { logs } = await pghr13_v0.methods['verify(uint256[],uint64[],bytes32,bytes32)'](proof2, inputs, vkId, proofId, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'Verified')
      assert.equal(logs[0].args._proofId, proofId)
      assert.equal(logs[0].args._vkId, vkId)

    })

    it("evaluates a FALSE proof as false", async function () {

      let _result = await pghr13_v0.methods['verify(uint256[],uint64[],bytes32,bytes32)'].call(proof4, inputs, vkId, proofId2, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(_result, false)

    })

    it("emits a NotVerified event when a FALSE proof is submitted", async function () {

      const { logs } = await pghr13_v0.methods['verify(uint256[],uint64[],bytes32,bytes32)'](proof4, inputs, vkId, proofId2, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'NotVerified')
      assert.equal(logs[0].args._proofId, proofId2)
      assert.equal(logs[0].args._vkId, vkId)

    })

  })


  describe('verify() (NOT-OVERLOADED - tries to update the registry - not to be called through the registry (truffle test struggles with this one))', function () {

    beforeEach(async function () {
      await pghr13_v0.loadVk(vk2, {from: vkSubmitter})
    })

    it("stores the verifier's address in the verifier_registry", async function () {

      let _verifier = await verifier_registry.getVerifierContractAddress(pghr13_v0.address)
      assert.equal(_verifier, pghr13_v0.address)
    })

    it("evaluates a TRUE proof as true", async function () {
      //let _registry = await pghr13_v0.R.call()
      //console.log(_registry)

      let _result = await pghr13_v0.methods['verify(uint256[],uint64[],bytes32)'].call(proof2, inputs, vkId, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(_result, true)

    })

    it("emits a Verified event when a TRUE proof is submitted", async function () {

      const { logs } = await pghr13_v0.methods['verify(uint256[],uint64[],bytes32)'](proof2, inputs, vkId, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'Verified')
      assert.equal(logs[0].args._proofId, proofId)
      assert.equal(logs[0].args._vkId, vkId)

    })

    it("evaluates a FALSE proof as false", async function () {

      let _result = await pghr13_v0.methods['verify(uint256[],uint64[],bytes32)'].call(proof4, inputs, vkId, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(_result, false)

    })

    it("emits a NotVerified event when a FALSE proof is submitted", async function () {

      const { logs } = await pghr13_v0.methods['verify(uint256[],uint64[],bytes32)'](proof4, inputs, vkId, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'NotVerified')
      assert.equal(logs[0].args._proofId, proofId2)
      assert.equal(logs[0].args._vkId, vkId)

    })

  })

})
