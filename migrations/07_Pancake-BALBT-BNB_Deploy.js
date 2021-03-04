const fs = require('fs');
const ethJsUtil = require('ethereumjs-util');

const BalleRewardedVaultV1 = artifacts.require('BalleRewardedVaultV1');
const CakeLPStrategyV1 = artifacts.require('CakeLPStrategyV1');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  // Get addresses
  const pancakePairAddress = networkConfig.PancakePairAddress;
  const pancakeRouterAddress = networkConfig.PancakeRouterAddress;
  const masterchefAddress = networkConfig.MasterchefAddress;
  const vaultRewardPoolAddress = networkConfig.vaultRewardPoolAddress;
  const balle = networkConfig.BALLE;

  if (network == 'bsc_mainnet') {
  } else {
    let nonce = await web3.eth.getTransactionCount(accounts[0])
    console.log('NONCE: ', nonce)
    let strategyAddress = ethJsUtil.bufferToHex(ethJsUtil.generateAddress(accounts[0], nonce + 1));
    console.log('ADDRESS: ', strategyAddress)

    let ballePancakeBALBT_BNB = await deployer.new(
      BalleRewardedVaultV1, pancakePairAddress, strategyAddress, 
      'Balle Pancake bALBT-BNB', 'ballePancakeBALBT-BNB', 60,
      balle, vaultRewardPoolAddress, 100
    );
    console.log(ballePancakeBALBT_BNB === undefined ? "UNDEFINED!!??" : "OK");
    /*
    // de nuevo lo mismo, el primer deployer.new(...) devuelve undefined!!
    if (ballePancakeBALBT_BNB === undefined) {

      nonce = await web3.eth.getTransactionCount(accounts[0])
      console.log('NONCE: ', nonce)
      strategyAddress = ethJsUtil.bufferToHex(ethJsUtil.generateAddress(accounts[0], nonce + 1));
      console.log('ADDRESS: ', strategyAddress)

      ballePancakeBALBT_BNB = await deployer.new(
        BalleRewardedVaultV1, pancakePairAddress, strategyAddress, 
        'Balle Pancake bALBT-BNB', 'ballePancakeBALBT-BNB', 60,
        balle, vaultRewardPoolAddress, 100
      );
      console.log(ballePancakeBALBT_BNB === undefined ? "UNDEFINED!!??" : "OK");
    }*/
    networkConfig['ballePancakeBALBT_BNB'] = ballePancakeBALBT_BNB.address;

  }

};
