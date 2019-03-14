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

const SafeMath = artifacts.require('SafeMath')
//const ERC20Interface = artifacts.require('ERC20Interface')
const Coin = artifacts.require('Coin')
const CoinShield = artifacts.require('ExampleCoinShield')


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const address1 = "0x1111111111111111111111111111111111111111"
const address2 = "0x2222222222222222222222222222222222222222"



contract('CoinShield', ([_, registryOwner, verifierOwner, vkSubmitter, proofSubmitter, coinTransactor, anotherAccount]) => {

  console.log("registryOwner", registryOwner)
  console.log("verifierOwner", verifierOwner)
  console.log("vkSubmitter", vkSubmitter)
  console.log("proofSubmitter", proofSubmitter)
  console.log("anotherAccount", anotherAccount)
  console.log("coinTransactor", coinTransactor)

  let verifier_register_library
  let verifier_registry

  let points
  let pairing_v0
  let pghr13_lib_v0
  let pghr13_v0

  let safeMath
  let coin
  let coinShield

  let vk
  let vk2
  let vkId

  let proof
  let proof2
  let proofId

  let inputs
  let z

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

    //deploy SafeMath library
    safeMath = await SafeMath.new()

    //deploy the Coin contract
    await Coin.link("SafeMath", safeMath.address)
    coin = await Coin.new()

    //deploy CoinShield
    coinShield = await CoinShield.new( pghr13_v0.address, coin.address )

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

    z = utils.decToHex(inputs[1])

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

  describe('constructor()', function () {

    it("stores the verifier's address in this (coinShield)", async function () {

      let _verifier = await coinShield.v.call()

      assert.equal(_verifier, pghr13_v0.address)
    })

    it("stores the coin contract's address in this (coinShield)", async function () {

      let _coin = await coinShield.coin.call()

      assert.equal(_coin, coin.address)
    })

  })


  describe('ft mint() through coinShield', function () {

    beforeEach(async function () {
      await verifier_registry.registerVk(vk2, [pghr13_v0.address], {from: vkSubmitter})

      await coin.mint(coinTransactor, '20000', {from: coinTransactor})

      await coin.approve(coinShield.address, '20000', {from: coinTransactor})
    })

    describe('when a VALID mint proof is submitted', function () {
/*
      it("mints a coin", async function () {

        await coinShield.mint('10000', proof2, inputs, vkId, {from: coinTransactor})

        let _z = await coinShield.zs(z)

        console.log("_z", _z)
        console.log("z", z)

        assert.equal(utils.hexToDec(_z), utils.hexToDec(z))
      })
*/

      it('emits Mint event', async function () {

        const { logs } = await coinShield.mint('10000', proof2, inputs, vkId, {from: coinTransactor})
        //console.log(logs)
        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'Mint')
        assert.equal(logs[0].args.amount, '10000')
      })
    })
  })
})
