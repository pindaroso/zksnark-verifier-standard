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
const BN256G2 = artifacts.require('BN256G2')
const Pairing_v1 = artifacts.require('Pairing_v1')
const GM17_lib_v0 = artifacts.require('GM17_lib_v0')
const GM17_v0 = artifacts.require('GM17_v0')


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const address1 = "0x1111111111111111111111111111111111111111"
const address2 = "0x2222222222222222222222222222222222222222"



contract('GM17_v0', ([_, registryOwner, verifierOwner, vkSubmitter, proofSubmitter, anotherAccount]) => {

  console.log("registryOwner", registryOwner)
  console.log("verifierOwner", verifierOwner)
  console.log("vkSubmitter", vkSubmitter)
  console.log("proofSubmitter", proofSubmitter)
  console.log("anotherAccount", anotherAccount)

  let verifier_register_library
  let verifier_registry

  let points
  let bn256g2
  let pairing_v1
  let gm17_lib_v0
  let gm17_v0

  let vk_gm
  let vk_gm_uint
  let vkId_gm

  let vk_gm_false
  let vk_gm_false_uint
  let vkId_gm_false

  let proof_gm
  let proof_gm_uint
  let proofId_gm

  let proof_gm_false
  let proof_gm_false_uint
  let proofId_gm_false

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

    bn256g2 = await BN256G2.new()

    //deploy the Pairing_v1 library
    await Pairing_v1.link("Points", points.address)
    //await Pairing_v1.link("BN256G2", bn256g2.address)
    pairing_v1 = await Pairing_v1.new()

    //deploy GM17_lib_v0 library
    await GM17_lib_v0.link("Points", points.address)
    //await GM17_lib_v0.link("BN256G2", bn256g2.address)
    gm17_lib_v0 = await GM17_lib_v0.new()

    //deploy GM17_v0
    await GM17_v0.link("BN256G2", bn256g2.address)
    await GM17_v0.link("GM17_lib_v0", gm17_lib_v0.address)
    gm17_v0 = await GM17_v0.new( verifier_registry.address )

    //for debugging deployments:

    //console.log("verifier_register_library address", verifier_register_library.address)
    //
    //console.log("verifier_registry address", verifier_registry.address)
    /*
    console.log("points address", points.address)
    console.log("pairing_v1 address", pairing_v1.address)
    console.log("gm17_lib_v0 address", gm17_lib_v0.address)
    console.log("gm17_v0 address", gm17_v0.address)
    */

    await assignVksAndProofs();

  })

  describe('constructor()', function () {

    it("stores the gm17 verifier's address in the verifier_registry", async function () {

      let _verifier = await verifier_registry.getVerifierContractAddress.call(gm17_v0.address)
      assert.equal(_verifier, gm17_v0.address)
    })

    it("stores the verifier registry's address in the gm17 verifier", async function () {

      let _registry = await gm17_v0.R.call()

      assert.equal(_registry, verifier_registry.address)
    })

  })



  describe('verificationCalculation()', function () {

    beforeEach(async function () {
      await verifier_registry.registerVk(vk_gm_uint, [gm17_v0.address], {from: vkSubmitter})
    })

    it("evaluates a TRUE proof_gm as true", async function () {
      //let _registry = await gm17_v0.R.call()
      //console.log(_registry)

      let _result = await gm17_v0.verificationCalculation.call(proof_gm_uint, inputs, vkId_gm, {from: proofSubmitter})

      assert.equal(_result, 0)

    })

    it('evaluates a FALSE proof_gm as false', async function () {

      let _result = await gm17_v0.verificationCalculation.call(proof_gm_false_uint, inputs, vkId_gm, {from: proofSubmitter})
      console.log('_result')
      console.log(_result)
      assert.notEqual(_result, 0)
    })

  })


  // describe('verifyFromRegistry() (plain evaluation - does not try to update the registry)', function () {
  //
  //   beforeEach(async function () {
  //     await verifier_registry.registerVk(vk_gm_uint, [gm17_v0.address], {from: vkSubmitter})
  //   })
  //
  //   it("stores the verifier's address in the verifier_registry", async function () {
  //
  //     let _verifier = await verifier_registry.getVerifierContractAddress(gm17_v0.address)
  //     assert.equal(_verifier, gm17_v0.address)
  //   })
  //
  //   it("evaluates a TRUE proof_gm as true", async function () {
  //     //let _registry = await gm17_v0.R.call()
  //     //console.log(_registry)
  //
  //     let _result = await gm17_v0.methods['verifyFromRegistry(uint256[],uint256[],bytes32)'].call(proof_gm_uint, inputs, vkId_gm, {from: verifier_registry.address, gas: 6500000})
  //
  //     assert.equal(_result, true)
  //
  //   })
  //
  //   it("evaluates a FALSE proof_gm as false", async function () {
  //
  //     let _result = await gm17_v0.methods['verifyFromRegistry(uint256[],uint256[],bytes32)'].call(proof_gm_false_uint, inputs, vkId_gm, {from: verifier_registry.address, gas: 6500000})
  //
  //     assert.equal(_result, false)
  //
  //   })
  // })


  describe('verify() (tries to update the registry)', function () {

    beforeEach(async function () {
      await verifier_registry.registerVk(vk_gm_uint, [gm17_v0.address], {from: vkSubmitter})
    })

    it("stores the verifier's address in the verifier_registry", async function () {

      let _verifier = await verifier_registry.getVerifierContractAddress(gm17_v0.address)
      assert.equal(_verifier, gm17_v0.address)
    })

    it("evaluates a TRUE proof_gm as true", async function () {
      //let _registry = await gm17_v0.R.call()
      //console.log(_registry)

      let _result = await gm17_v0.methods['verify(uint256[],uint256[],bytes32)'].call(proof_gm_uint, inputs, vkId_gm, {from: proofSubmitter, gas: 6500000})

      assert.equal(_result, true)

    })
    it("evaluates a FALSE proof_gm as false", async function () {

      let _result = await gm17_v0.methods['verify(uint256[],uint256[],bytes32)'].call(proof_gm_false_uint, inputs, vkId_gm, {from: proofSubmitter, gas: 6500000})

      assert.equal(_result, false)

    })
  })















  async function assignVksAndProofs() {

    //console.log("Reading vk_gm from json file...")
    const VERIFYING_KEY_GM17_v0 = "./test/jsons/GM17-vk.json"
    vk_gm = await new Promise((resolve, reject) => {
      jsonfile.readFile(VERIFYING_KEY_GM17_v0, (err, data) => {
        //jsonfile doesn't natively support promises
        if (err) reject(err)
        else resolve(data)
      })
    })
    vk_gm = Object.values(vk_gm)
    //convert to flattened array:
    vk_gm = utils.flattenDeep(vk_gm);
    //console.log("vk_gm readfile check:")
    //console.log(vk_gm)
    vk_gm_uint = vk_gm.map(el => utils.hexToDec(el))
    //console.log("vk_gm_uint")
    //console.log(vk_gm_uint)
    vkId_gm = web3.utils.soliditySha3(vk_gm_uint[0], vk_gm_uint[1], vk_gm_uint[2], vk_gm_uint[3], vk_gm_uint[4], vk_gm_uint[5], vk_gm_uint[6], vk_gm_uint[7], vk_gm_uint[8], vk_gm_uint[9], vk_gm_uint[10], vk_gm_uint[11], vk_gm_uint[12], vk_gm_uint[13], vk_gm_uint[14], vk_gm_uint[15], vk_gm_uint[16], vk_gm_uint[17], vk_gm_uint[18], vk_gm_uint[19], vk_gm_uint[20], vk_gm_uint[21], vk_gm_uint[22], vk_gm_uint[23])
    //console.log("vkId_gm")
    //console.log(vkId_gm)


    //console.log("Reading proof_gm object from json file...")
    const PROOF_GM17_v0 = "./test/jsons/GM17-proof.json"
    proof_gm = await new Promise((resolve, reject) => {
      jsonfile.readFile(PROOF_GM17_v0, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    //console.log("proof_gm readfile check:", proof_gm.A)
    proof_gm = Object.values(proof_gm)
    //convert to flattened array:
    proof_gm = utils.flattenDeep(proof_gm);
    //console.log("proof_gm")
    //console.log(proof_gm)
    proof_gm_uint = proof_gm.map(el => utils.hexToDec(el))
    //console.log("proof_gm_uint")
    //console.log(proof_gm_uint)

    inputs = ['10000','8308427066351555919','1'];

    proofId_gm = web3.utils.soliditySha3(proof_gm_uint[0], proof_gm_uint[1], proof_gm_uint[2], proof_gm_uint[3], proof_gm_uint[4], proof_gm_uint[5], proof_gm_uint[6], proof_gm_uint[7], inputs[0], inputs[1], inputs[2])
    //console.log("proofId_gm")
    //console.log(proofId_gm)


    //console.log("Reading vk_gm from json file...")
    const FALSE_VERIFYING_KEY_GM17_v0 = "./test/jsons/GM17-false-vk.json"
    vk_gm_false = await new Promise((resolve, reject) => {
      jsonfile.readFile(FALSE_VERIFYING_KEY_GM17_v0, (err, data) => {
        //jsonfile doesn't natively support promises
        if (err) reject(err)
        else resolve(data)
      })
    })
    vk_gm_false = Object.values(vk_gm_false)
    //convert to flattened array:
    vk_gm_false = utils.flattenDeep(vk_gm_false);
    //console.log("vk_gm readfile check:")
    //console.log(vk_gm)
    vk_gm_false_uint = vk_gm_false.map(el => utils.hexToDec(el))
    //console.log("vk_gm_uint")
    //console.log(vk_gm_uint)
    vkId_gm_false = web3.utils.soliditySha3(vk_gm_false_uint[0], vk_gm_false_uint[1], vk_gm_false_uint[2], vk_gm_false_uint[3], vk_gm_false_uint[4], vk_gm_false_uint[5], vk_gm_false_uint[6], vk_gm_false_uint[7], vk_gm_false_uint[8], vk_gm_false_uint[9], vk_gm_false_uint[10], vk_gm_false_uint[11], vk_gm_false_uint[12], vk_gm_false_uint[13], vk_gm_false_uint[14], vk_gm_false_uint[15], vk_gm_false_uint[16], vk_gm_false_uint[17], vk_gm_false_uint[18], vk_gm_false_uint[19], vk_gm_false_uint[20], vk_gm_false_uint[21], vk_gm_false_uint[22], vk_gm_false_uint[23])
    //console.log("vkId_gm")
    //console.log(vkId_gm)


    //console.log("Reading proof_gm object from json file...")
    const FALSE_PROOF_GM17_v0 = "./test/jsons/gm17-false-proof.json"
    proof_gm_false = await new Promise((resolve, reject) => {
      jsonfile.readFile(FALSE_PROOF_GM17_v0, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    //console.log("proof_gm readfile check:", proof_gm.A)
    proof_gm_false = Object.values(proof_gm_false)
    //convert to flattened array:
    proof_gm_false = utils.flattenDeep(proof_gm_false);
    //console.log("proof_gm")
    //console.log(proof_gm)
    proof_gm_false_uint = proof_gm_false.map(el => utils.hexToDec(el))
    //console.log("proof_gm_uint")
    //console.log(proof_gm_uint)

    proofId_gm_false = web3.utils.soliditySha3(proof_gm_false_uint[0], proof_gm_false_uint[1], proof_gm_false_uint[2], proof_gm_false_uint[3], proof_gm_false_uint[4], proof_gm_false_uint[5], proof_gm_false_uint[6], proof_gm_false_uint[7], inputs[0], inputs[1], inputs[2])
    //console.log("proofId_gm")
    //console.log(proofId_gm)
  }

})
