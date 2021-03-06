contract('RewardPool', ([owner, account1, account2, account3, account4]) => {
    const RewardPool = artifacts.require('RewardPool')
    const BALLE = artifacts.require('BALLE')
    const toBN = web3.utils.toBN
    
    describe.only('Test RewardPool', () => {
        it('should accept payments from strategy', async () => {
            const rewardPoolInstance = await RewardPool.deployed()
            const balleInstance = await BALLE.deployed()
            await balleInstance.addMinter(owner);
            await balleInstance.mint(rewardPoolInstance.address, toBN(10E18))
            const balance = await balleInstance.balanceOf(rewardPoolInstance.address)
            
            expect(balance.eq(toBN(10E18))).to.be.true
        })

    })
})
