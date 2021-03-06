// contracts/mocks/WBNB.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IMintableERC20.sol";

contract WBNB is ERC20, IMintableERC20 {

    constructor() ERC20('Wrapped BNB', 'WBNB') {
        _mint(msg.sender, 5000 * (10 ** uint256(decimals())));
    }

    function mint(address _to, uint256 _amount) public override {
        _mint(_to, _amount);
    }
    
    function burn(address _from ,uint256 _amount) public override {
        _burn(_from, _amount);
    }
}
