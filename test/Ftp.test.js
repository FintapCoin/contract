const { ethers } = require("hardhat");
const { expect } = require('chai');

const INIT_SUPPLY = 10000;
const AMOUNT = 100;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("Ftp contract", function () {

  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    let factory = await ethers.getContractFactory("Ftp");
    [owner, addr1, addr2] = await ethers.getSigners();

    contract = await factory.deploy(addr1.address, INIT_SUPPLY);
  });

  describe("Test constants", async function () {
    it('Name is correct', async function () {
      expect(await contract.name()).to.be.equal("Fintap");
    });
    it('Symbol is correct', async function () {
      expect(await contract.symbol()).to.be.equal("FTP");
    });
    it('Decimals is correct', async function () {
      expect(await contract.decimals()).to.be.equal(8);
    });
  });

  describe("Init supply test", async function () {
    it('Total supply is correct', async function () {
      expect(await contract.totalSupply()).to.be.equal(INIT_SUPPLY);
    });
    it('Do not supply money to owner', async function () {
      expect(await contract.balanceOf(owner.address)).to.be.equal(0);
    });
    it('Supply all money to addr1', async function () {
      expect(await contract.balanceOf(addr1.address)).to.be.equal(INIT_SUPPLY);
    });
  });

  describe("Transfer test", async function () {
    it('Emits a Transfer event', async function () {
      await expect(contract.connect(addr1).transfer(addr2.address, AMOUNT))
        .to.emit(contract, 'Transfer')
        .withArgs(addr1.address, addr2.address, AMOUNT);
    });

    it('Updates balances', async function () {
      await contract.connect(addr1).transfer(addr2.address, AMOUNT);

      expect(await contract.balanceOf(addr1.address)).to.be.equal(INIT_SUPPLY - AMOUNT);
      expect(await contract.balanceOf(addr2.address)).to.be.equal(AMOUNT);
    });

    it('Reverts when transferring too many tokens', async function () {
      await expect(
        contract.connect(addr1).transfer(addr2.address, INIT_SUPPLY + 1)
      ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
    });

    it('Reverts when transferring to zero address', async function () {
      await expect(
        contract.transfer(ZERO_ADDRESS, AMOUNT),
      ).to.be.revertedWith('ERC20: transfer to the zero address');
    });
  });

  describe("Allowance tests", async function () {
    it('Emits a Approve event', async function () {
      await expect(contract.connect(addr1).approve(addr2.address, AMOUNT))
        .to.emit(contract, 'Approval')
        .withArgs(addr1.address, addr2.address, AMOUNT);
    });

    it('Approve', async function () {
      await contract.connect(addr1).approve(addr2.address, INIT_SUPPLY);
      expect(await contract.allowance(addr1.address, addr2.address)).to.be.equal(INIT_SUPPLY);
    });

    it('Updates balances', async function () {
      await contract.connect(addr1).approve(addr2.address, INIT_SUPPLY);
      await contract.connect(addr2).transferFrom(addr1.address, addr2.address, AMOUNT);

      expect(await contract.allowance(addr1.address, addr2.address)).to.be.equal(INIT_SUPPLY - AMOUNT);
      expect(await contract.balanceOf(addr1.address)).to.be.equal(INIT_SUPPLY - AMOUNT);
      expect(await contract.balanceOf(addr2.address)).to.be.equal(AMOUNT);
    });

    it('Reverts when transferring too many tokens', async function () {
      await contract.connect(addr1).approve(addr2.address, AMOUNT);

      await expect(
        contract.connect(addr2).transferFrom(addr1.address, addr2.address, AMOUNT + 1)
      ).to.be.revertedWith('ERC20: transfer amount exceeds allowance');
    });

    it('Increse allowance', async function () {
      await contract.connect(addr1).increaseAllowance(addr2.address, AMOUNT);
      expect(await contract.allowance(addr1.address, addr2.address)).to.be.equal(AMOUNT);
    });

    it('Decrese allowance', async function () {
      await contract.connect(addr1).approve(addr2.address, INIT_SUPPLY);
      await contract.connect(addr1).decreaseAllowance(addr2.address, AMOUNT);

      expect(await contract.allowance(addr1.address, addr2.address)).to.be.equal(INIT_SUPPLY - AMOUNT);
    });

    it('Reverts when decreaseAllowance below zero', async function () {
      await contract.connect(addr1).approve(addr2.address, AMOUNT);

      await expect(
        contract.connect(addr2).decreaseAllowance(addr2.address, AMOUNT + 1)
      ).to.be.revertedWith('ERC20: decreased allowance below zero');
    });
  });
});
