const fs = require('fs');

const BalleDevTeamVesting = artifacts.require('BalleDevTeamVesting');

module.exports = async function (deployer, network, accounts) {

  if (network != 'develop') {
    // Load network config data
    const networkConfigFilename = `.env.${network}.json`;
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
    let txRegistry = networkConfig.txRegistry;

    // Get addresses
    let devTeamAddress;
    if (network == 'development') {
      devTeamAddress = accounts;
    } else {
      // load from network config
      devTeamAddress = networkConfig.devTeamAddress;
    }
    const balleAddress = networkConfig.BALLE;

    let devTeamVesting;
    const NUMBER = 3;
    // inexplicablemente, la primera creación devuelve 'undefined'
    devTeamVesting = await deployer.new(BalleDevTeamVesting, balleAddress, devTeamAddress[NUMBER]);
    console.log(devTeamVesting === undefined ? 'UNDEFINED!!??' : `OK ${devTeamVesting.address}`);
    if (devTeamVesting === undefined) {
      devTeamVesting = await deployer.new(BalleDevTeamVesting, balleAddress, devTeamAddress[NUMBER]);
      console.log(devTeamVesting === undefined ? 'UNDEFINED!!??' : `OK ${devTeamVesting.address}`);
    }
    console.log(`TX: ${devTeamVesting.transactionHash}`);
    txRegistry.push(devTeamVesting.transactionHash);

    networkConfig['txRegistry'] = txRegistry;
    networkConfig['devTeamVestingAddress'][NUMBER] = devTeamVesting.address;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  }
  
};
