import { BALLEInstance, RewardPoolInstance } from "../types/truffle-contracts"

contract('RewardPool', ([owner, account1, account2, account3, account4]) => {
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
            const res = await rewardPoolInstance.notifyRewardAmount(toBN(1e18))
            
            // Inspect data
            const rewardPoolBalance = await balleInstance.balanceOf(rewardPoolInstance.address)
            const stakedBalance = await rewardPoolInstance.totalSupply()
            const lastTimeRewardApplicable = await rewardPoolInstance.lastTimeRewardApplicable()
            const rewardPerToken = await rewardPoolInstance.rewardPerToken()
            console.log(`rewardBalance: ${rewardPoolBalance.toString()}`)
            console.log(`stakedBalance: ${stakedBalance.toString()}`)
            console.log(`lastTimeRewardApplicable: ${lastTimeRewardApplicable.toString()}`)
            console.log(`rewardPerToken: ${rewardPerToken.toString()}`)
            //
            
            expect(res)
                .to.have.property('tx')
        })

    })

})
