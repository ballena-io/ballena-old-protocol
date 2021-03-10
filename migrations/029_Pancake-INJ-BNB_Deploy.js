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
    const rewardPoolAddress = networkConfig.rewardPoolAddress;
    const balle = networkConfig.BALLE;
    const wbnb = networkConfig.WBNB;
    const cake = networkConfig.CAKE;
    // Vault data
    const pancakePairAddress = '0x7a34bd64d18e44cfde3ef4b81b87baf3eb3315b6'; // Cake-LP INJ-BNB
    const name = 'Balle Pancake INJ-BNB';
    const symbol = 'ballePancakeINJ-BNB';
    const approvalDelay = 28800;
    // Strategy data
    const poolId = 27; //  Pancake Pool ID
    const pancakeRouterAddress = networkConfig.pancakeRouterAddress;
    const masterChefAddress = networkConfig.masterChefAddress;

    let nonce = await web3.eth.getTransactionCount(accounts[0])
    console.log('NONCE: ', nonce)
    let strategyAddress = ethJsUtil.bufferToHex(ethJsUtil.generateAddress(accounts[0], nonce + 1));
    console.log('ADDRESS: ', strategyAddress)

    let balleVault = await deployer.new(BalleRewardedVaultV1, 
      pancakePairAddress, strategyAddress, 
      name, symbol, approvalDelay,
      balle, vaultRewardPoolAddress
    );
    console.log(balleVault === undefined ? 'UNDEFINED!!??' : `OK ${balleVault.address}`);
    console.log(`TX: ${balleVault.transactionHash}\r\n`);
    txRegistry.push(balleVault.transactionHash);

    let stratPancakeLP = await deployer.new(CakeLPStrategyV1,
      wbnb, balle, cake, pancakeRouterAddress, masterChefAddress,
      pancakePairAddress, poolId, rewardPoolAddress, treasuryAddress,
      balleVault.address
    );
    console.log(stratPancakeLP === undefined ? 'UNDEFINED!!??' : `OK ${stratPancakeLP.address}`);
    console.log(`TX: ${stratPancakeLP.transactionHash}\r\n`);
    txRegistry.push(stratPancakeLP.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['ballePancakeINJ_BNB'] = balleVault.address;
    networkConfig['stratPancakeINJ_BNB'] = stratPancakeLP.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

  }

};
