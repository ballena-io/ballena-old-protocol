const fs = require('fs');
const ethJsUtil = require('ethereumjs-util');

const BalleRewardedVaultV1 = artifacts.require('BalleRewardedVaultV1');
const CakeLPStrategyV1 = artifacts.require('CakeLPStrategyV1');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network != 'develop') {
    let txRegistry = networkConfig.txRegistry;

    // Get addresses
    const vaultRewardPoolAddress = networkConfig.vaultRewardPoolAddress;
    const treasuryAddress = networkConfig.treasuryAddress;
    const rewardPotAddress = networkConfig.rewardPotAddress;
    const balle = networkConfig.BALLE;
    const wbnb = networkConfig.WBNB;
    const cake = networkConfig.CAKE;
    // Vault data
    const pancakePairAddress = networkConfig.CakeLP_bALBT_BNB;
    const name = 'Balle Pancake bALBT-BNB';
    const symbol = 'ballePancakeBALBT-BNB';
    const approvalDelay = 28800;
    // Strategy data
    const pancakeRouterAddress = networkConfig.pancakeRouterAddress;
    const masterChefAddress = networkConfig.masterChefAddress;
    const poolId = 49;

    let nonce = await web3.eth.getTransactionCount(accounts[0])
    console.log('NONCE: ', nonce)
    let strategyAddress = ethJsUtil.bufferToHex(ethJsUtil.generateAddress(accounts[0], nonce + 1));
    console.log('ADDRESS: ', strategyAddress)

    let ballePancakeBALBT_BNB = await deployer.new(BalleRewardedVaultV2, 
      pancakePairAddress, strategyAddress, 
      name, symbol, approvalDelay,
      balle, vaultRewardPoolAddress
    );
    console.log(ballePancakeBALBT_BNB === undefined ? 'UNDEFINED!!??' : `OK ${ballePancakeBALBT_BNB.address}`);
    console.log(`TX: ${ballePancakeBALBT_BNB.transactionHash}\r\n`);
    txRegistry.push(ballePancakeBALBT_BNB.transactionHash);

    let stratPancakeBALBT_BNB = await deployer.new(CakeLPStrategyV2,
      wbnb, balle, cake, pancakeRouterAddress, masterChefAddress,
      pancakePairAddress, poolId, rewardPotAddress, treasuryAddress,
      ballePancakeBALBT_BNB.address
    );
    console.log(stratPancakeBALBT_BNB === undefined ? 'UNDEFINED!!??' : `OK ${stratPancakeBALBT_BNB.address}`);
    console.log(`TX: ${stratPancakeBALBT_BNB.transactionHash}\r\n`);
    txRegistry.push(stratPancakeBALBT_BNB.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['ballePancakeBALBT_BNB_V2'] = ballePancakeBALBT_BNB.address;
    networkConfig['stratPancakeBALBT_BNB_V2'] = stratPancakeBALBT_BNB.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

  }

};
