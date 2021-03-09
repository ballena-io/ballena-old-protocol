import { VaultRewardPoolInstance, RewardedVaultMock1Instance, RewardedVaultMock2Instance } from "../types/truffle-contracts"

contract.only('VaultRewardPool', ([owner, account1, account2, account3, account4]) => {
    const VaultRewardPool = artifacts.require('VaultRewardPool')
    const RewardedVaultMock1 = artifacts.require('RewardedVaultMock1')
    const RewardedVaultMock2 = artifacts.require('RewardedVaultMock2')
    const BALLE = artifacts.require('BALLE')
    const toBN = web3.utils.toBN
    const getBlock = async (): Promise<number> => web3.eth.getBlockNumber()
    
    describe('Test protected methods', () => {
        let vaultRewardPoolInstance: VaultRewardPoolInstance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            vaultRewardPoolInstance = await VaultRewardPool.deployed()
        })

        it('should not allow to call protected activateVault()', async () => {
            const res = await vaultRewardPoolInstance.activateVault(account1, 1, {from: account1})
                .catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
        })

        it('should not allow to call protected retireVault()', async () => {
            const res = await vaultRewardPoolInstance.retireVault(account1, {from: account1})
                .catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
        })

        it('should not allow to call protected updateMultiplier()', async () => {
            const res = await vaultRewardPoolInstance.updateMultiplier(account1, 1, {from: account1})
                .catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
        })

    })

    describe('Test rewards', () => {
        let vaultRewardPoolInstance: VaultRewardPoolInstance
        let rewardedVaultMock1Instance: RewardedVaultMock1Instance
        let rewardedVaultMock2Instance: RewardedVaultMock2Instance
        let blockReward = toBN('2283105022831050')
        let prevLastBlock = toBN('0')

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            vaultRewardPoolInstance = await VaultRewardPool.deployed()
            rewardedVaultMock1Instance = await RewardedVaultMock1.deployed()
            rewardedVaultMock2Instance = await RewardedVaultMock2.deployed()
        })

        it('should activate and reward vault 1', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.addMinter(owner);
            // fund reward pool
            await balleInstance.mint(vaultRewardPoolInstance.address, toBN(24e18))
            
            // activate first vault
            let tx = await vaultRewardPoolInstance.activateVault(rewardedVaultMock1Instance.address, 100)
            const startBlock = tx.receipt.blockNumber

            // do some transactions to get blocks mined
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))

            const startBalance = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)

            // get rewards from first vault
            tx = await rewardedVaultMock1Instance.getRewards()
            const endBlock = tx.receipt.blockNumber
            const endBalance = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)

            expect(endBalance.toString()).to.be.eq(
                startBalance.add(blockReward.mul(toBN(endBlock - startBlock))).toString()
            )
        })

        it('should activate vault 2', async () => {
            const balleInstance = await BALLE.deployed()
            
            // do some transactions to get blocks mined
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))

            const startBalance = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)
            const startBlock = await rewardedVaultMock1Instance.getLastBlock()

            // activate vault 2
            let tx = await vaultRewardPoolInstance.activateVault(rewardedVaultMock2Instance.address, 300)
            const endBlock = tx.receipt.blockNumber
            // save last block for next test
            prevLastBlock = toBN(endBlock)

            // first vault will get paid with pending rewards before addindg second (and new reward ratio calculated)
            const endBalance = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)

            expect(endBalance.toString()).to.be.eq(
                startBalance.add(blockReward.mul(toBN(endBlock).sub(startBlock))).toString()
            )
        })

        it('should update vault 1 multiplier', async () => {
            const balleInstance = await BALLE.deployed()
            
            // do some transactions to get blocks mined
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))

            // get start balance from vault 1
            const startBalance1 = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)
            // get start balance from vault 2
            const startBalance2 = await balleInstance.balanceOf(rewardedVaultMock2Instance.address)
            // start block is the last from previous test
            const startBlock = prevLastBlock

            // modify vault 1 multiplier
            let tx = await vaultRewardPoolInstance.updateMultiplier(rewardedVaultMock1Instance.address, 200)
            const endBlock = tx.receipt.blockNumber
            // save last block for next test
            prevLastBlock = toBN(endBlock)

            // all vaults will get paid with pending rewards before apply change (and new reward ratios calculated)
            const endBalance1 = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)
            const endBalance2 = await balleInstance.balanceOf(rewardedVaultMock2Instance.address)

            expect(endBalance2.toString()).to.be.eq(
                startBalance2.add(
                    blockReward.mul(toBN(endBlock).sub(startBlock)).div(toBN(4)).mul(toBN(3))
                ).toString()
            )
            expect(endBalance1.toString()).to.be.eq(
                startBalance1.add(
                    blockReward.mul(toBN(endBlock).sub(startBlock)).div(toBN(4))
                ).toString()
            )
        })

        it('should retire vault 2', async () => {
            const balleInstance = await BALLE.deployed()
            
            // do some transactions to get blocks mined
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))

            // get start balance from vault 1
            const startBalance1 = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)
            // get start balance from vault 2
            const startBalance2 = await balleInstance.balanceOf(rewardedVaultMock2Instance.address)
            // start block is the last from previous test
            const startBlock = prevLastBlock

            // retire vault 2
            let tx = await vaultRewardPoolInstance.retireVault(rewardedVaultMock2Instance.address)
            const endBlock = tx.receipt.blockNumber
            // save last block for next test
            prevLastBlock = toBN(endBlock)

            // all vaults will get paid with pending rewards before apply change (and new reward ratios calculated)
            const endBalance1 = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)
            const endBalance2 = await balleInstance.balanceOf(rewardedVaultMock2Instance.address)

            expect(endBalance2.toString()).to.be.eq(
                startBalance2.add(
                    blockReward.mul(toBN(endBlock).sub(startBlock)).div(toBN(5)).mul(toBN(3))
                ).toString()
            )
            expect(endBalance1.toString()).to.be.eq(
                startBalance1.add(
                    blockReward.mul(toBN(endBlock).sub(startBlock)).div(toBN(5)).mul(toBN(2))
                ).toString()
            )
        })

        it('should retire vault 1', async () => {
            const balleInstance = await BALLE.deployed()
            
            // do some transactions to get blocks mined
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))
            await balleInstance.mint(account4, toBN(1e18))

            // get start balance from vault 1
            const startBalance1 = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)
            // start block is the last from previous test
            const startBlock = prevLastBlock

            // retire vault 1
            let tx = await vaultRewardPoolInstance.retireVault(rewardedVaultMock1Instance.address)
            const endBlock = tx.receipt.blockNumber
            // save last block for next test
            prevLastBlock = toBN(endBlock)

            // all vaults will get paid with pending rewards before apply change (and new reward ratios calculated)
            const endBalance1 = await balleInstance.balanceOf(rewardedVaultMock1Instance.address)

            expect(endBalance1.toString()).to.be.eq(
                startBalance1.add(
                    blockReward.mul(toBN(endBlock).sub(startBlock))
                ).toString()
            )
        })

    })

    describe('Test activations and desactivations', () => {
        let vaultRewardPoolInstance: VaultRewardPoolInstance
        let rewardedVaultMock1Instance: RewardedVaultMock1Instance
        let rewardedVaultMock2Instance: RewardedVaultMock2Instance

        beforeEach(async () => {
            // To deploy a new contract for each test, use .new() instead of .deployed()
            vaultRewardPoolInstance = await VaultRewardPool.deployed()
            rewardedVaultMock1Instance = await RewardedVaultMock1.deployed()
            rewardedVaultMock2Instance = await RewardedVaultMock2.deployed()
        })

        it('should not allow to retire inactive vault', async () => {
            const res = await vaultRewardPoolInstance.retireVault(rewardedVaultMock1Instance.address)
                .catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
                .to.be.equals('Vault is not active')
        })

        it('should not allow to change multiplier on inactive vault', async () => {
            const res = await vaultRewardPoolInstance.updateMultiplier(rewardedVaultMock1Instance.address, 100)
                .catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
                .to.be.equals('Vault is not active')
        })

        it('should activate vault 1', async () => {
            const balleInstance = await BALLE.deployed()
            await balleInstance.addMinter(owner);
            
            // activate vault 1
            let tx = await vaultRewardPoolInstance.activateVault(rewardedVaultMock1Instance.address, 100)
            const startBlock = tx.receipt.blockNumber

            expect(true)
        })

        it('should not allow to activate vault 1 again', async () => {
            const res = await vaultRewardPoolInstance.activateVault(rewardedVaultMock1Instance.address, 100)
                .catch((err: Error) => err)

            expect(res)
                .to.be.an.instanceOf(Error)
                .and.to.have.property('reason')
                .to.be.equals('Vault is already active')
        })

    })


})
