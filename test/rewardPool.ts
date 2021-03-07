import { BALLEInstance, RewardPoolInstance } from "../types/truffle-contracts"

contract.only('RewardPool', ([owner, account1, account2, account3, account4]) => {
    const RewardPool = artifacts.require('RewardPool')
    const BALLE = artifacts.require('BALLE')
    const WBNB = artifacts.require('WBNB')
    const toBN = web3.utils.toBN
    
    describe('Test transfer and protected methods', () => {
        let rewardPoolInstance: RewardPoolInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            rewardPoolInstance = await RewardPool.deployed()
        })

        it('should accept payments from strategy', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.addMinter(owner);
            await balleInstance.mint(rewardPoolInstance.address, toBN(1e18))
            const balance = await balleInstance.balanceOf(rewardPoolInstance.address)
            
            expect(balance.toString()).to.be.eq(toBN(1E18).toString())
        })

        it('should not send the funds out', async () => {
            const balleInstance = await BALLE.deployed()
            
            const balance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const res = await balleInstance.transferFrom(
                rewardPoolInstance.address, account1, toBN(1e18))
                .catch((err: Error) => err)
            
            expect(balance.toString()).to.be.eq(toBN(1E18).toString())
            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
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

        it('should allow rewardDistribution to call notifyRewardAmount()', async () => {
            const balleInstance = await BALLE.deployed()

            await rewardPoolInstance.setRewardDistribution(owner)
            const res = await rewardPoolInstance.notifyRewardAmount(toBN(5e18))

            // Inspect data
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const lastTimeRewardApplicable = await rewardPoolInstance.lastTimeRewardApplicable()
            const periodFinish = await rewardPoolInstance.periodFinish()
            const rewardRate = await rewardPoolInstance.rewardRate()
            const lastUpdateTime = await rewardPoolInstance.lastUpdateTime()
            const rewardPerToken = await rewardPoolInstance.rewardPerToken()
            const rewardPerTokenStored = await rewardPoolInstance.rewardPerTokenStored()
            console.log(`rewardBalance: ${rewardPoolBalance.toString()}`)
            console.log(`stakedBalance: ${stakedBalance.toString()}`)
            console.log(`lastTimeRewardApplicable: ${lastTimeRewardApplicable.toString()}`)
            console.log(`periodFinish: ${periodFinish.toString()}`)
            console.log(`rewardRate: ${rewardRate.toString()}`)
            console.log(`lastUpdateTime: ${lastUpdateTime.toString()}`)
            console.log(`rewardPerToken: ${rewardPerToken.toString()}`)
            console.log(`rewardPerTokenStored: ${rewardPerTokenStored.toString()}`)
            //
            
            expect(res)
                .to.have.property('tx')
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

            expect(rewardPoolBalance.toString()).to.be.eq(toBN(11E18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(10E18).toString())
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
            expect(rewardPoolBalance.toString()).to.be.eq(toBN(11E18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(10E18).toString())
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
            
            expect(rewardPoolBalance.toString()).to.be.eq(toBN(16E18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(15E18).toString())
            expect(userBalance.toString()).to.be.eq(toBN(10E18).toString())
        })

    })

    describe('Test rewards', () => {
        let rewardPoolInstance: RewardPoolInstance
        let balleInstance: BALLEInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            rewardPoolInstance = await RewardPool.deployed()
            balleInstance = await BALLE.deployed()
        })

        it('should check balances', async () => {
            // Check starting balances
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const userBalance = await rewardPoolInstance.balanceOf(owner)

            expect(rewardPoolBalance.toString()).to.be.eq(toBN(16E18).toString())
            expect(stakedBalance.toString()).to.be.eq(toBN(15E18).toString())
            expect(userBalance.toString()).to.be.eq(toBN(10E18).toString())
        })

        it('should allow rewardDistribution to call notifyRewardAmount()', async () => {
            const balleInstance = await BALLE.deployed()

            await rewardPoolInstance.setRewardDistribution(owner)
            const res = await rewardPoolInstance.notifyRewardAmount(toBN(1e18))
            
            // Inspect data
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const lastTimeRewardApplicable = await rewardPoolInstance.lastTimeRewardApplicable()
            const periodFinish = await rewardPoolInstance.periodFinish()
            const rewardRate = await rewardPoolInstance.rewardRate()
            const lastUpdateTime = await rewardPoolInstance.lastUpdateTime()
            const rewardPerToken = await rewardPoolInstance.rewardPerToken()
            const rewardPerTokenStored = await rewardPoolInstance.rewardPerTokenStored()
            const pendingRewards = await rewardPoolInstance.pendingRewards()
            console.log(`rewardBalance: ${rewardPoolBalance.toString()}`)
            console.log(`stakedBalance: ${stakedBalance.toString()}`)
            console.log(`lastTimeRewardApplicable: ${lastTimeRewardApplicable.toString()}`)
            console.log(`periodFinish: ${periodFinish.toString()}`)
            console.log(`rewardRate: ${rewardRate.toString()}`)
            console.log(`lastUpdateTime: ${lastUpdateTime.toString()}`)
            console.log(`rewardPerToken: ${rewardPerToken.toString()}`)
            console.log(`rewardPerTokenStored: ${rewardPerTokenStored.toString()}`)
            console.log(`pendingRewards: ${pendingRewards.toString()}`)
            //
            
            expect(res)
                .to.have.property('tx')
        })

    })

})
