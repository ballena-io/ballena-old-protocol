// contracts/mocks/IMintableERC20.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IMintableERC20 is IERC20 {
    function mint(address _to, uint256 _amount) external;
    function burn(address _from ,uint256 _amount) external;
}