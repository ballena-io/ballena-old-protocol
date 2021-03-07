// contracts/governance/LPTokenWrapper.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract LPTokenWrapper {
    using SafeMath for uint256;

    IERC20 public immutable balle;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    constructor (address _balle) {
        require(_balle != address(0), "Illegal address");
        
        balle = IERC20(_balle);
    }

    // totalSupply visibility is public as it's meant to be called from derived contract
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    // balanceOf visibility is public as it's meant to be called from derived contract
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    // stake visibility is public as it's meant to be called from derived contract
    function stake(uint256 amount) virtual public {
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        balle.transferFrom(msg.sender, address(this), amount);
    }

    // withdraw visibility is public as it's meant to be called from derived contract
    function withdraw(uint256 amount) virtual public {
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        if (balle.balanceOf(address(this)) < amount) {
            // just in case rounding
            amount = balle.balanceOf(address(this));
        }
        balle.transfer(msg.sender, amount);
    }
}
