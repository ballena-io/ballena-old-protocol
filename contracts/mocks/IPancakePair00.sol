// contracts/interfaces/IPancakePair.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

interface IPancakePair00 {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function mint(address to) external returns (uint liquidity);
}
