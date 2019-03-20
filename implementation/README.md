# ZK Snarks and Standard Interface Implementation

All of these example are run on the command line starting from the `implementation` directory.

## Installation

All requirements for using this project, including debugging tools, are included as `package.json` dependencies. Install using the standard npm tool.

```sh
npm install
```

This will also install the correct version of Ganache.

## Run tests

Spin up Ganache and Truffle in one terminal.

```sh
npx ganache-cli -a 10 -e 1000 -l 80000000
```

Leave this window open. Then open another terminal and start the tests.

```sh
npx truffle test
```