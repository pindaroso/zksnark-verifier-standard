/**
@module utils.js
@author Westlad,CKonda,MichaelConnorOfficial
@desc Set of utilities to manipulate variable into forms most liked by
Ethereum
*/


// FUNCTIONS ON HEX VALUES

/**
utility function to check that a string has a leading 0x (which the Solidity
compiler uses to check for a hex string).  It adds it if it's not present. If
it is present then it returns the string unaltered
*/
function ensure0x(hex) {
  if (typeof hex === 'undefined') hex = ""
  hex = hex.toString()
  if (typeof hex === 'string' && hex.indexOf('0x') != 0) hex = '0x' + hex
  return hex
}

/**
utility function to remove a leading 0x on a string representing a hex number.
If no 0x is present then it returns the string un-altered.
*/
function strip0x(hex) {
  if (typeof hex == 'undefined') return ""
  if (typeof hex == 'string' && hex.indexOf('0x') == 0) hex = hex.slice(2)
  return hex.toString()
}


//Converts hex strings to decimal values
function hexToDec(hexStr) {
  if (hexStr.substring(0, 2) === '0x') hexStr = hexStr.substring(2);
  hexStr = hexStr.toLowerCase();
  return convertBase(hexStr, 16, 10);
}


//FUNCITONS ON DECIMAL VALUES

//Converts decimal value strings to hex values
function decToHex(decStr) {
  var hex = convertBase(decStr, 10, 16);
  return hex ? '0x' + hex : null;
}

//UTILITY FUNCTIONS:

/** Helper function for the converting any base to any base
 */
function add(x, y, base) {
  var z = [];
  var n = Math.max(x.length, y.length);
  var carry = 0;
  var i = 0;
  while (i < n || carry) {
    var xi = i < x.length ? x[i] : 0;
    var yi = i < y.length ? y[i] : 0;
    var zi = carry + xi + yi;
    z.push(zi % base);
    carry = Math.floor(zi / base);
    i++;
  }
  return z;
}

/** Helper function for the converting any base to any base
 Returns a*x, where x is an array of decimal digits and a is an ordinary
 JavaScript number. base is the number base of the array x.
*/
function multiplyByNumber(num, x, base) {
  if (num < 0) return null;
  if (num == 0) return [];

  var result = [];
  var power = x;
  while (true) {
    if (num & 1) {
      result = add(result, power, base);
    }
    num = num >> 1;
    if (num === 0) break;
    power = add(power, power, base);
  }

  return result;
}

/** Helper function for the converting any base to any base
 */
function parseToDigitsArray(str, base) {
  var digits = str.split('');
  var ary = [];
  for (var i = digits.length - 1; i >= 0; i--) {
    var n = parseInt(digits[i], base);
    if (isNaN(n)) return null;
    ary.push(n);
  }
  return ary;
}

/** Helper function for the converting any base to any base
 */
function convertBase(str, fromBase, toBase) {
  var digits = parseToDigitsArray(str, fromBase);
  if (digits === null) return null;

  var outArray = [];
  var power = [1];
  for (var i = 0; i < digits.length; i++) {
    // invariant: at this point, fromBase^i = power
    if (digits[i]) {
      outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
    }
    power = multiplyByNumber(fromBase, power, toBase);
  }

  var out = '';
  for (var i = outArray.length - 1; i >= 0; i--) {
    out += outArray[i].toString(toBase);
  }
  //if the original input was equivalent to zero, then 'out' will still be empty ''. Let's check for zero.
  if (out === '') {
    let sum = 0
    for (var i = 0; i< digits.length; i++ ){
      sum += digits[i]
    }
    if (sum == 0) out = '0'
  }

  return out;
}


/* flattenDeep converts a nested array into a flattened array. We use this to pass our proofs and vks into the verifier contract.
Example:
A vk of the form:
[
  [
    [ '1','2' ],
    [ '3','4' ]
  ],
    [ '5','6' ],
    [
      [ '7','8' ], [ '9','10' ]
    ],
  [
    [ '11','12' ],
    [ '13','14' ]
  ],
    [ '15','16' ],
    [
      [ '17','18' ], [ '19','20' ]
    ],
  [
    [ '21','22' ],
    [ '23','24' ]
  ],
  [
    [ '25','26' ],
    [ '27','28' ],
    [ '29','30' ],
    [ '31','32' ]
  ]
]

is converted to:
['1','2','3','4','5','6',...]
*/
function flattenDeep(arr) {
  return arr.reduce((acc, val) =>
    Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
  []);
}


module.exports = {
  ensure0x,
  strip0x,
  hexToDec,
  decToHex,
  multiplyByNumber,
  parseToDigitsArray,
  convertBase,
  flattenDeep,
  add
}
