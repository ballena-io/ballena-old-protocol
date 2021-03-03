// contracts/utils/BulkSender.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract BulkSender {
    using SafeERC20 for IERC20;

    function bulksendToken(IERC20 _token, address[] memory _to, uint256[] memory _values) external {
        require(_to.length == _values.length || _values.length == 1);

        if (_values.length == 1) {
            uint256 value = _values[0];
            for (uint256 i = 0; i < _to.length; i++) {
                _token.transferFrom(msg.sender, _to[i], value);
            }
        } else {
            for (uint256 i = 0; i < _to.length; i++) {
                _token.transferFrom(msg.sender, _to[i], _values[i]);
            }
        }
    }
}
