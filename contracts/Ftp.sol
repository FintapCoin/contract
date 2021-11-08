//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Ftp is ERC20 {
    constructor(address target, uint256 initialSupply) ERC20("Fintap", "FTP") {
        _mint(target, initialSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return 8;
    }
}
