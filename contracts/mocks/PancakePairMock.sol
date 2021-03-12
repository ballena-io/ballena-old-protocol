// contracts/mocks/IPancakePair00.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IMintableERC20.sol";
import "./IPancakePair00.sol";

contract ERC20Token is ERC20, IMintableERC20, IPancakePair00 {

    address public override token0;
    address public override token1;

    constructor(string memory _name, string memory _symbol) ERC20(string(_name), string(_symbol)) {
        _mint(msg.sender, 5000 * (10 ** uint256(decimals())));
    }

    function mint(address _to, uint256 _amount) public override {
        _mint(_to, _amount);
    }
    
    function burn(address _from ,uint256 _amount) public override {
        _burn(_from, _amount);
    }

    function initialize(address _token0, address _token1) public {
        token0 = _token0;
        token1 = _token1;
    }

    function mint(address to) external override returns (uint liquidity) {
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));

        liquidity = balance0 + balance1;
        _mint(to, liquidity);
    }

}
