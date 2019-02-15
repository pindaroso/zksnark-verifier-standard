/**
CREDITS:
// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Points library and this Struct library modularised by Michael Connor, EY, 2019
*/

pragma solidity ^0.4.24;

import "./Points.sol";

/**
 @title PGHR13_v0
 @dev Version 0 of verifying key struct format - for PGHR13 proofs.
 @notice Do not use this example in any production code!
 */

library PGHR13_lib_v0 {

  using Points for *;

  struct Vk_PGHR13_v0 {
      Points.G2Point A;
      Points.G1Point B;
      Points.G2Point C;
      Points.G2Point gamma;
      Points.G1Point gammaBeta1;
      Points.G2Point gammaBeta2;
      Points.G2Point Z;
      Points.G1Point[] IC;
  }

  struct Proof_PGHR13_v0 {
      Points.G1Point A;
      Points.G1Point A_p;
      Points.G2Point B;
      Points.G1Point B_p;
      Points.G1Point C;
      Points.G1Point C_p;
      Points.G1Point K;
      Points.G1Point H;
  }

}
