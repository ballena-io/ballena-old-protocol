import { BALLEInstance, ExtraRewardPotInstance, RewardPotInstance, RewardPoolInstance, BalleTreasuryInstance } from "../types/truffle-contracts"

contract.only('RewardPool', ([owner, account1, account2, account3, account4]) => {
    const Treasury = artifacts.require('BalleTreasury')
    const ExtraRewardPot = artifacts.require('ExtraRewardPot')
    const RewardPot = artifacts.require('RewardPot')
    const RewardPool = artifacts.require('RewardPool')
    const BALLE = artifacts.require('BALLE')
    const WBNB = artifacts.require('WBNB')
    const toBN = web3.utils.toBN
    
    describe('Test protected methods', () => {
        let rewardPoolInstance: RewardPoolInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            rewardPoolInstance = await RewardPool.deployed()
        })

        it('should not allow to call protected setRewardDistribution()', async () => {
            const res = await rewardPoolInstance.setRewardDistribution(account1, {from: account1})
                .catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
        })

        it('should not allow to call protected notifyRewardAmount()', async () => {
            const res = await rewardPoolInstance.notifyRewardAmount(toBN(1e18))
                .catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
                .to.be.equal('Caller is not reward distribution')
        })

    })

    describe('Test staking of BALLE', () => {
        let rewardPoolInstance: RewardPoolInstance
        let balleInstance: BALLEInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            rewardPoolInstance = await RewardPool.deployed()
            balleInstance = await BALLE.deployed()
        })

        it('should accept BALLE staking', async () => {
            // Mint some BALLE
            await balleInstance.addMinter(owner);
            await balleInstance.mint(owner, toBN(10e18))
            await balleInstance.mint(account1, toBN(5e18))

            // Stake 5 BALLE from owner
            await balleInstance.approve(rewardPoolInstance.address, toBN(5e18))
            await rewardPoolInstance.stake(toBN(5e18))
            // Stake 5 BALLE from account 1
            await balleInstance.approve(rewardPoolInstance.address, toBN(5e18), {from: account1})
            await rewardPoolInstance.stake(toBN(5e18), {from: account1})
            // Get BALLE balance on contract
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            // Get staked BALLE tokens
            const stakedBalance = await rewardPoolInstance.totalSupply()

            expect(rewardPoolBalance.toString()).to.be.eq(toBN(10e18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(10e18).toString())
        })

        it('should not accept other coins staking', async () => {
            // Mint some WBNB
            const wbnbInstance = await WBNB.deployed()
            await wbnbInstance.mint(account1, toBN(10e18));

            await wbnbInstance.approve(rewardPoolInstance.address, toBN(5e18), {from: account1})
            // Try to stake WBNB
            const res = await rewardPoolInstance.stake(toBN(5e18), {from: account1})
                .catch((err: Error) => err)
            // Get BALLE balance on contract
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            // Get staked BALLE tokens
            const stakedBalance = await rewardPoolInstance.totalSupply()
            
            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
            expect(rewardPoolBalance.toString()).to.be.eq(toBN(10e18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(10e18).toString())
        })

        it('should respect allowance limit', async () => {
            // Try to stake when no allowance remain
            const res = await rewardPoolInstance.stake(toBN(5e18))
                .catch((err: Error) => err)
            
            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
        })

        it('should accept additional staking', async () => {
            // Add allowance and stake
            await balleInstance.approve(rewardPoolInstance.address, toBN(5e18))
            await rewardPoolInstance.stake(toBN(5e18))
            // Get BALLE balance on contract
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            // Get staked BALLE tokens
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const userBalance = await rewardPoolInstance.balanceOf(owner)
            
            expect(rewardPoolBalance.toString()).to.be.eq(toBN(15e18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(15e18).toString())
            expect(userBalance.toString()).to.be.eq(toBN(10e18).toString())
        })

    })

    describe('Test notify rewards', () => {
        let rewardPotInstance: RewardPotInstance
        let rewardPoolInstance: RewardPoolInstance
        let balleInstance: BALLEInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            rewardPotInstance = await RewardPot.deployed()
            rewardPoolInstance = await RewardPool.deployed()
            balleInstance = await BALLE.deployed()
        })

        it('should check balances', async () => {
            // Check starting balances
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const userBalance = await rewardPoolInstance.balanceOf(owner)

            expect(rewardPoolBalance.toString()).to.be.eq(toBN(15e18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(15e18).toString())
            expect(userBalance.toString()).to.be.eq(toBN(10e18).toString())
        })

        it('should allow rewardDistribution to call notifyRewardAmount()', async () => {
            const balleInstance = await BALLE.deployed()
            // activate pool on RewardPot
            await rewardPotInstance.activatePool(rewardPoolInstance.address, true)
            // fund pot (this is done from strategies, as commisions get generated)
            await balleInstance.mint(rewardPotInstance.address, toBN(1e18));
            // notify pool of new reward ammount available
            await rewardPoolInstance.setRewardDistribution(owner)
            await rewardPoolInstance.notifyRewardAmount(toBN(1e18))

            // check balances
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const rewardPotBalance = await balleInstance.balanceOf(rewardPotInstance.address)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            
            expect(rewardPotBalance.toString()).to.be.eq(toBN(0).toString())
            expect(rewardPoolBalance.toString()).to.be.eq(toBN(16e18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(15e18).toString())
        })

    })

    describe('Test pool withdraw', () => {
        let treasuryInstance: BalleTreasuryInstance
        let extraRewardPotInstance: ExtraRewardPotInstance
        let rewardPotInstance: RewardPotInstance
        let rewardPoolInstance: RewardPoolInstance
        let balleInstance: BALLEInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            treasuryInstance = await Treasury.deployed()
            extraRewardPotInstance = await ExtraRewardPot.deployed()
            rewardPotInstance = await RewardPot.deployed()
            rewardPoolInstance = await RewardPool.deployed()
            balleInstance = await BALLE.deployed()
        })

        it('should check balances', async () => {
            // Check starting balances
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const user1Balance = await rewardPoolInstance.balanceOf(owner)
            const user2Balance = await rewardPoolInstance.balanceOf(account1)
            const treasuryBalance = await balleInstance.balanceOf(treasuryInstance.address)
            const user1WalletBalance = await balleInstance.balanceOf(owner)
            const user2WalletBalance = await balleInstance.balanceOf(account1)

            expect(rewardPoolBalance.toString()).to.be.eq(toBN(16e18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(15e18).toString())
            expect(user1Balance.toString()).to.be.eq(toBN(10e18).toString())
            expect(user2Balance.toString()).to.be.eq(toBN(5e18).toString())
            expect(treasuryBalance.toString()).to.be.eq(toBN(0).toString())
            expect(user1WalletBalance.toString()).to.be.eq(toBN(0).toString())
            expect(user2WalletBalance.toString()).to.be.eq(toBN(0).toString())
        })

        it('should withdraw partial stake and rewards', async () => {
            // withdraw 5 BALLE
            await rewardPoolInstance.withdraw(toBN(5e18))

            // check balances
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const userBalance = await rewardPoolInstance.balanceOf(owner)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const treasuryBalance = await balleInstance.balanceOf(treasuryInstance.address)
            const user1WalletBalance = await balleInstance.balanceOf(owner)

            console.log(`user1WalletBalance: ${user1WalletBalance}`)
            console.log(`rewardPoolBalance: ${rewardPoolBalance}`)
            console.log(`treasuryBalance: ${treasuryBalance}`)

            expect(rewardPoolBalance.toString()).to.be.eq(toBN(11e18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(10e18).toString())
            expect(userBalance.toString()).to.be.eq(toBN(5e18).toString())
        })

        it('should withdraw all balance and rewards', async () => {
            // exit pool (user2, 5 BALLE)
            await rewardPoolInstance.exit({from: account1})

            // check balances
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const userBalance = await rewardPoolInstance.balanceOf(account1)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const treasuryBalance = await balleInstance.balanceOf(treasuryInstance.address)
            const user2WalletBalance = await balleInstance.balanceOf(account1)

            expect(stakedBalance.toString()).to.be.eq(toBN(5e18).toString())
            expect(userBalance.toString()).to.be.eq(toBN(0).toString())
            expect(rewardPoolBalance.add(user2WalletBalance).add(treasuryBalance).toString())
                .to.be.eq(toBN(11e18).toString())
        })

        it('should activate extra rewards for the pool', async () => {
            // activate pool on ExtraRewardPot
            await extraRewardPotInstance.activatePool(rewardPoolInstance.address, 200)
            // fund extra pot (this is done on BALLE minting)
            await balleInstance.mint(extraRewardPotInstance.address, toBN(10e18));

            expect(true)
        })

        it('should get rewards', async () => {
            // get rewards (user1)
            await rewardPoolInstance.getReward()

            // check balances
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const userBalance = await rewardPoolInstance.balanceOf(owner)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const treasuryBalance = await balleInstance.balanceOf(treasuryInstance.address)
            const extraRewardPotBalance = await balleInstance.balanceOf(extraRewardPotInstance.address)
            const userWalletBalance = await balleInstance.balanceOf(owner)
            const user2WalletBalance = await balleInstance.balanceOf(account1)

            expect(stakedBalance.toString()).to.be.eq(toBN(5e18).toString())
            expect(userBalance.toString()).to.be.eq(toBN(5e18).toString())
            expect(rewardPoolBalance.add(user2WalletBalance).add(treasuryBalance)
                .add(userWalletBalance).sub(toBN(5e18)).add(extraRewardPotBalance).toString())
                .to.be.eq(toBN(21e18).toString())
        })

    })

})
