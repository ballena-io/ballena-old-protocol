import { BALLEInstance, RewardPotInstance } from "../types/truffle-contracts"

contract.only('RewardPot', ([owner, account1, account2, account3, account4]) => {
    const RewardPot = artifacts.require('RewardPot')
    const BALLE = artifacts.require('BALLE')
    const WBNB = artifacts.require('WBNB')
    const toBN = web3.utils.toBN
    
    describe('Test transfer and protected methods', () => {
        let rewardPotInstance: RewardPotInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            rewardPotInstance = await RewardPot.deployed()
        })

        it('should reject the sending of funds', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.addMinter(owner);
            await balleInstance.mint(rewardPotInstance.address, toBN(1e18))

            const startBalance = await balleInstance.balanceOf(rewardPotInstance.address)
            const res = await rewardPotInstance.getReward(toBN(1e16))
                .catch((err: Error) => err)
            const endBalance = await balleInstance.balanceOf(rewardPotInstance.address)
            
            expect(startBalance.toString()).to.be.eq(endBalance.toString())
            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
                .to.be.equal('!authorized')
        })

        it('should owner authorize rewarded pools', async () => {
            const res = await rewardPotInstance.activatePool(account1, true)
            
            expect(true)
        })

        it('should send requested funds', async () => {
            const balleInstance = await BALLE.deployed()

            const startBalance = await balleInstance.balanceOf(rewardPotInstance.address)
            const res = await rewardPotInstance.getReward(toBN(1e16), {from: account1})
            const endBalance = await balleInstance.balanceOf(rewardPotInstance.address)
            const dstBalance = await balleInstance.balanceOf(account1)
            
            expect(startBalance.toString()).to.be.eq(endBalance.add(toBN(1e16)).toString())
            expect(dstBalance.toString()).to.be.eq(toBN(1e16).toString())
        })

        it('should owner deauthorize rewarded pools', async () => {
            const res = await rewardPotInstance.activatePool(account1, false)
            
            expect(true)
        })

        it('should reject the sending of funds', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.addMinter(owner);
            await balleInstance.mint(rewardPotInstance.address, toBN(1e18))

            const startBalance = await balleInstance.balanceOf(rewardPotInstance.address)
            const res = await rewardPotInstance.getReward(toBN(1e16), {from: account1})
                .catch((err: Error) => err)
            const endBalance = await balleInstance.balanceOf(rewardPotInstance.address)
            
            expect(startBalance.toString()).to.be.eq(endBalance.toString())
            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
                .to.be.equal('!authorized')
        })

    })


})
