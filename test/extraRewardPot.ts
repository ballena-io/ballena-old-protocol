import { BALLEInstance, ExtraRewardPotInstance } from "../types/truffle-contracts"

contract('RewardPot', ([owner, account1, account2, account3, account4]) => {
    const ExtraRewardPot = artifacts.require('ExtraRewardPot')
    const BALLE = artifacts.require('BALLE')
    const toBN = web3.utils.toBN
    
    describe('Test transfer and protected methods', () => {
        let extraRewardPotInstance: ExtraRewardPotInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            extraRewardPotInstance = await ExtraRewardPot.deployed()
        })

        it('should reject to get reward to anyone', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.addMinter(owner);
            await balleInstance.mint(extraRewardPotInstance.address, toBN(1e18))

            const startBalance = await balleInstance.balanceOf(extraRewardPotInstance.address)
            await extraRewardPotInstance.getReward(toBN(1e16))
            const endBalance = await balleInstance.balanceOf(extraRewardPotInstance.address)
            
            expect(startBalance.toString()).to.be.eq(endBalance.toString())
        })

        it('should owner authorize rewarded pools', async () => {
            await extraRewardPotInstance.activatePool(account1, 2) // set multiplier to 2
            
            expect(true)
        })

        it('should send requested reward', async () => {
            const balleInstance = await BALLE.deployed()

            const startBalance = await balleInstance.balanceOf(extraRewardPotInstance.address)
            await extraRewardPotInstance.getReward(toBN(1e16), {from: account1})
            const endBalance = await balleInstance.balanceOf(extraRewardPotInstance.address)
            const dstBalance = await balleInstance.balanceOf(account1)
            
            // reward value will be multiplicated by multiplicator set for address (2 in this case)
            expect(startBalance.toString()).to.be.eq(endBalance.add(toBN(2e16)).toString())
            expect(dstBalance.toString()).to.be.eq(toBN(2e16).toString())
        })

        it('should owner deauthorize rewarded pools', async () => {
            await extraRewardPotInstance.activatePool(account1, 0)
            
            expect(true)
        })

        it('should reject the sending of funds', async () => {
            const balleInstance = await BALLE.deployed()

            const startBalance = await balleInstance.balanceOf(extraRewardPotInstance.address)
            const res = await extraRewardPotInstance.getReward(toBN(1e16), {from: account1})
                .catch((err: Error) => err)
            const endBalance = await balleInstance.balanceOf(extraRewardPotInstance.address)
            
            expect(startBalance.toString()).to.be.eq(endBalance.toString())
        })

    })


})
