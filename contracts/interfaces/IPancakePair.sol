// contracts/interfaces/IPancakePair.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

interface IPancakePair {
    function token0() external view returns (address);
    function token1() external view returns (address);
}
