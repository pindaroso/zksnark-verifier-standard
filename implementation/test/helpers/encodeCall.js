const abi = require('ethereumjs-abi')

//returns the 'function signature' of a function, which can be passed to (and understood by) a raw 'call' or 'delegatecall' in assembly.
function encodeCall(name, arguments, values) {
  const methodId = abi.methodID(name, arguments).toString('hex');
  const params = abi.rawEncode(arguments, values).toString('hex');
  return '0x' + methodId + params;
}

module.exports = encodeCall;
