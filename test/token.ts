contract('BALLE', ([owner, account1, account2, account3, account4]) => {
    const BALLE = artifacts.require("BALLE")
    
    describe('Test BALLE token', () => {
        it('gobernance should be the owner', async () => {
            const balleInstance = await BALLE.deployed()
            const governance = await balleInstance.governance()

            expect(governance).to.be.equal(owner)
        })

        it('should mint 100 BALLE to owner', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.addMinter(owner);
            await balleInstance.mint(owner, 100)
            const balance = await balleInstance.balanceOf(owner)

            expect(balance.toNumber()).to.be.equal(100)
        })

        it('should transfer 50 BALLE from owner to account1', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.transfer(account1, 50)
            const balance = await balleInstance.balanceOf(owner)
            const balance1 = await balleInstance.balanceOf(account1)

            expect(balance.toNumber()).to.be.equal(50)
            expect(balance1.toNumber()).to.be.equal(50)
        })

        it('should not mint after remove minter', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.removeMinter(owner)
            const res = await balleInstance.mint(owner, 100).catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
                .to.be.equal('!minter')
        })

        it('should not allow add minter after changing gobernance', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.removeMinter(owner)
            await balleInstance.setGovernance(account1)
            const res = await balleInstance.addMinter(owner).catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
                .to.be.equal('!governance')
        })
    })
})
