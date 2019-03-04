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



contract('PGHR13_v0', ([_, registryOwner, verifierOwner, vkSubmitter, proofSubmitter, anotherAccount]) => {

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

  let vk_pghr
  let vk_pghr_uint
  let vkId_pghr

  let vk_pghr_false
  let vk_pghr_false_uint
  let vkId_pghr_false

  let proof_pghr
  let proof_pghr_uint
  let proofId_pghr

  let proof_pghr_false
  let proof_pghr_false_uint
  let proofId_pghr_false

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

    await assignVksAndProofs();

  })

  describe('constructor()', function () {

    it("stores the pghr13 verifier's address in the verifier_registry", async function () {

      let _verifier = await verifier_registry.getVerifierContractAddress.call(pghr13_v0.address)
      assert.equal(_verifier, pghr13_v0.address)
    })

    it("stores the verifier registry's address in the pghr13 verifier", async function () {

      let _registry = await pghr13_v0.R.call()

      assert.equal(_registry, verifier_registry.address)
    })

  })

  describe('verificationCalculation()', function () {

    beforeEach(async function () {
      await verifier_registry.registerVk(vk_pghr_uint, [pghr13_v0.address], {from: vkSubmitter})
    })

    it("evaluates a TRUE proof_pghr as true", async function () {
      //let _registry = await pghr13_v0.R.call()
      //console.log(_registry)

      let _result = await pghr13_v0.verificationCalculation.call(proof_pghr_uint, inputs, vkId_pghr, {from: proofSubmitter})

      assert.equal(_result, 0)

    })

    it('evaluates a FALSE proof_pghr as false', async function () {

      let _result = await pghr13_v0.verificationCalculation.call(proof_pghr_false_uint, inputs, vkId_pghr, {from: proofSubmitter})
      console.log('_result')
      console.log(_result)
      assert.notEqual(_result, 0)
    })

  })


  describe('verifyFromRegistry() (plain evaluation - does not try to update the registry)', function () {

    beforeEach(async function () {
      await verifier_registry.registerVk(vk_pghr_uint, [pghr13_v0.address], {from: vkSubmitter})
    })

    it("stores the pghr verifier's address in the verifier_registry", async function () {

      let _verifier = await verifier_registry.getVerifierContractAddress(pghr13_v0.address)
      assert.equal(_verifier, pghr13_v0.address)
    })

    it("evaluates a TRUE proof_pghr as true", async function () {
      //let _registry = await pghr13_v0.R.call()
      //console.log(_registry)

      let _result = await pghr13_v0.methods['verifyFromRegistry(uint256[],uint256[],bytes32)'].call(proof_pghr_uint, inputs, vkId_pghr, {from: verifier_registry.address, gas: 1000000000000})

      assert.equal(_result, true)

    })
/*
    it("emits a Verified event when a TRUE proof_pghr is submitted", async function () {

      const { logs } = await pghr13_v0.methods['verifyFromRegistry(uint256[],uint256[],bytes32)'](proof_pghr_uint, inputs, vkId_pghr, {from: verifier_registry.address, gas: 1000000000000})

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'Verified')
      assert.equal(logs[0].args._proofId, proofId_pghr)
      assert.equal(logs[0].args._vkId, vkId_pghr)

    })
*/
    it("evaluates a FALSE proof_pghr as false", async function () {

      let _result = await pghr13_v0.methods['verifyFromRegistry(uint256[],uint256[],bytes32)'].call(proof_pghr_false_uint, inputs, vkId_pghr, {from: verifier_registry.address, gas: 1000000000000})

      assert.equal(_result, false)

    })
/*
    it("emits a NotVerified event when a FALSE proof_pghr is submitted", async function () {

      const { logs } = await pghr13_v0.methods['verifyFromRegistry(uint256[],uint256[],bytes32)'](proof_pghr_false_uint, inputs, vkId_pghr, {from: verifier_registry.address, gas: 1000000000000})

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'NotVerified')
      assert.equal(logs[0].args._proofId, proofId_pghr_false)
      assert.equal(logs[0].args._vkId, vkId_pghr)

    })
*/
  })


  describe('verify() (tries to update the registry - not to be called through the registry (truffle test struggles with this one))', function () {

    beforeEach(async function () {
      await verifier_registry.registerVk(vk_pghr_uint, [pghr13_v0.address], {from: vkSubmitter})
    })

    it("stores the pghr verifier's address in the verifier_registry", async function () {

      let _verifier = await verifier_registry.getVerifierContractAddress(pghr13_v0.address)
      assert.equal(_verifier, pghr13_v0.address)
    })

    it("evaluates a TRUE proof_pghr as true", async function () {
      //let _registry = await pghr13_v0.R.call()
      //console.log(_registry)

      let _result = await pghr13_v0.methods['verify(uint256[],uint256[],bytes32)'].call(proof_pghr_uint, inputs, vkId_pghr, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(_result, true)

    })
/*
    it("emits a Verified event when a TRUE proof_pghr is submitted", async function () {

      const { logs } = await pghr13_v0.methods['verify(uint256[],uint256[],bytes32)'](proof_pghr_uint, inputs, vkId_pghr, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'Verified')
      assert.equal(logs[0].args._proofId, proofId_pghr)
      assert.equal(logs[0].args._vkId, vkId_pghr)

    })
*/
    it("evaluates a FALSE proof_pghr as false", async function () {

      let _result = await pghr13_v0.methods['verify(uint256[],uint256[],bytes32)'].call(proof_pghr_false_uint, inputs, vkId_pghr, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(_result, false)

    })
/*
    it("emits a NotVerified event when a FALSE proof_pghr is submitted", async function () {

      const { logs } = await pghr13_v0.methods['verify(uint256[],uint256[],bytes32)'](proof_pghr_false_uint, inputs, vkId_pghr, {from: proofSubmitter, gas: 1000000000000})

      assert.equal(logs.length, 1)
      assert.equal(logs[0].event, 'NotVerified')
      assert.equal(logs[0].args._proofId, proofId_pghr_false)
      assert.equal(logs[0].args._vkId, vkId_pghr)

    })
*/
  })















  async function assignVksAndProofs() {
    //console.log("Reading vk_pghr from json file...")
    const VERIFYING_KEY_PGHR13_v0 = "./test/jsons/PGHR13-vk.json"
    vk_pghr = await new Promise((resolve, reject) => {
      jsonfile.readFile(VERIFYING_KEY_PGHR13_v0, (err, data) => {
        //jsonfile doesn't natively support promises
        if (err) reject(err)
        else resolve(data)
      })
    })
    vk_pghr = Object.values(vk_pghr)
    //convert to flattened array:
    vk_pghr = utils.flattenDeep(vk_pghr);
    //console.log("vk_pghr readfile check:")
    //console.log(vk_pghr)
    vk_pghr_uint = vk_pghr.map(el => utils.hexToDec(el))
    //console.log("vk_pghr_uint")
    //console.log(vk_pghr_uint)
    vkId_pghr = web3.utils.soliditySha3(vk_pghr_uint[0], vk_pghr_uint[1], vk_pghr_uint[2], vk_pghr_uint[3], vk_pghr_uint[4], vk_pghr_uint[5], vk_pghr_uint[6], vk_pghr_uint[7], vk_pghr_uint[8], vk_pghr_uint[9], vk_pghr_uint[10], vk_pghr_uint[11], vk_pghr_uint[12], vk_pghr_uint[13], vk_pghr_uint[14], vk_pghr_uint[15], vk_pghr_uint[16], vk_pghr_uint[17], vk_pghr_uint[18], vk_pghr_uint[19], vk_pghr_uint[20], vk_pghr_uint[21], vk_pghr_uint[22], vk_pghr_uint[23], vk_pghr_uint[24], vk_pghr_uint[25], vk_pghr_uint[26], vk_pghr_uint[27], vk_pghr_uint[28], vk_pghr_uint[29], vk_pghr_uint[30], vk_pghr_uint[31])
    //console.log("vkId_pghr")
    //console.log(vkId_pghr)


    //console.log("Reading proof_pghr object from json file...")
    const PROOF_PGHR13_v0 = "./test/jsons/PGHR13-proof.json"
    proof_pghr = await new Promise((resolve, reject) => {
      jsonfile.readFile(PROOF_PGHR13_v0, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    //console.log("proof_pghr readfile check:", proof_pghr.A)
    proof_pghr = Object.values(proof_pghr)
    //convert to flattened array:
    proof_pghr = utils.flattenDeep(proof_pghr);
    //console.log("proof_pghr")
    //console.log(proof_pghr)
    proof_pghr_uint = proof_pghr.map(el => utils.hexToDec(el))
    //console.log("proof_pghr_uint")
    //console.log(proof_pghr_uint)

    inputs = ['10000','8308427066351555919','1'];

    proofId_pghr = web3.utils.soliditySha3(proof_pghr_uint[0], proof_pghr_uint[1], proof_pghr_uint[2], proof_pghr_uint[3], proof_pghr_uint[4], proof_pghr_uint[5], proof_pghr_uint[6], proof_pghr_uint[7], proof_pghr_uint[8], proof_pghr_uint[9], proof_pghr_uint[10], proof_pghr_uint[11], proof_pghr_uint[12], proof_pghr_uint[13], proof_pghr_uint[14], proof_pghr_uint[15], proof_pghr_uint[16], proof_pghr_uint[17], inputs[0], inputs[1], inputs[2])
    //console.log("proofId_pghr")
    //console.log(proofId_pghr)


    //console.log("Reading vk_pghr from json file...")
    const FALSE_VERIFYING_KEY_PGHR13_v0 = "./test/jsons/PGHR13-false-vk.json"
    vk_pghr_false = await new Promise((resolve, reject) => {
      jsonfile.readFile(FALSE_VERIFYING_KEY_PGHR13_v0, (err, data) => {
        //jsonfile doesn't natively support promises
        if (err) reject(err)
        else resolve(data)
      })
    })
    vk_pghr_false = Object.values(vk_pghr_false)
    //convert to flattened array:
    vk_pghr_false = utils.flattenDeep(vk_pghr_false);
    //console.log("vk_pghr readfile check:")
    //console.log(vk_pghr)
    vk_pghr_false_uint = vk_pghr_false.map(el => utils.hexToDec(el))
    //console.log("vk_pghr_uint")
    //console.log(vk_pghr_uint)
    vkId_pghr_false = web3.utils.soliditySha3(vk_pghr_false_uint[0], vk_pghr_false_uint[1], vk_pghr_false_uint[2], vk_pghr_false_uint[3], vk_pghr_false_uint[4], vk_pghr_false_uint[5], vk_pghr_false_uint[6], vk_pghr_false_uint[7], vk_pghr_false_uint[8], vk_pghr_false_uint[9], vk_pghr_false_uint[10], vk_pghr_false_uint[11], vk_pghr_false_uint[12], vk_pghr_false_uint[13], vk_pghr_false_uint[14], vk_pghr_false_uint[15], vk_pghr_false_uint[16], vk_pghr_false_uint[17], vk_pghr_false_uint[18], vk_pghr_false_uint[19], vk_pghr_false_uint[20], vk_pghr_false_uint[21], vk_pghr_false_uint[22], vk_pghr_false_uint[23], vk_pghr_false_uint[24], vk_pghr_false_uint[25], vk_pghr_false_uint[26], vk_pghr_false_uint[27], vk_pghr_false_uint[28], vk_pghr_false_uint[29], vk_pghr_false_uint[30], vk_pghr_false_uint[31])
    //console.log("vkId_pghr")
    //console.log(vkId_pghr)


    //console.log("Reading proof_pghr object from json file...")
    const FALSE_PROOF_PGHR13_v0 = "./test/jsons/PGHR13-false-proof.json"
    proof_pghr_false = await new Promise((resolve, reject) => {
      jsonfile.readFile(FALSE_PROOF_PGHR13_v0, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    //console.log("proof_pghr readfile check:", proof_pghr.A)
    proof_pghr_false = Object.values(proof_pghr_false)
    //convert to flattened array:
    proof_pghr_false = utils.flattenDeep(proof_pghr_false);
    //console.log("proof_pghr")
    //console.log(proof_pghr)
    proof_pghr_false_uint = proof_pghr_false.map(el => utils.hexToDec(el))
    //console.log("proof_pghr_uint")
    //console.log(proof_pghr_uint)

    proofId_pghr_false = web3.utils.soliditySha3(proof_pghr_false_uint[0], proof_pghr_false_uint[1], proof_pghr_false_uint[2], proof_pghr_false_uint[3], proof_pghr_false_uint[4], proof_pghr_false_uint[5], proof_pghr_false_uint[6], proof_pghr_false_uint[7], proof_pghr_false_uint[8], proof_pghr_false_uint[9], proof_pghr_false_uint[10], proof_pghr_false_uint[11], proof_pghr_false_uint[12], proof_pghr_false_uint[13], proof_pghr_false_uint[14], proof_pghr_false_uint[15], proof_pghr_false_uint[16], proof_pghr_false_uint[17], inputs[0], inputs[1], inputs[2])
    //console.log("proofId_pghr")
    //console.log(proofId_pghr)

  }

})
