const fs = require('fs');

const BalleTreasury = artifacts.require('BalleTreasury');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network == 'develop') {
    // environment for tests

    await deployer.deploy(BalleTreasury);

    networkConfig['treasuryAddress'] = BalleTreasury.address;

  } else {

    let txRegistry = networkConfig.txRegistry;

    // Deploy Treasury contract
    await deployer.deploy(BalleTreasury);
    txRegistry.push(BalleTreasury.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['treasuryAddress'] = BalleTreasury.address;

  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
