module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545, //9545?
      network_id: "*",
      gas: 1000000000000
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"  // ex:  "0.4.20". (Default: Truffle's installed solc)
    }
  },
  mocha: {
    enableTimeouts: false
  }
}
/*
development: {
  host: "localhost",
  port: 8545,
  network_id: "*", // Match any network id
  gas: 6000000,
  gasPrice: 20000000000
}
*/
