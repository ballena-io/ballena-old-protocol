const fs = require('fs');

const BalleDevTeamVesting = artifacts.require('BalleDevTeamVesting');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

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
  const NUMBER = 0;
  // inexplicablemente, la primera creación devuelve 'undefined'
  devTeamVesting = await deployer.new(BalleDevTeamVesting, balleAddress, devTeamAddress[NUMBER]);
  console.log(devTeamVesting === undefined ? 'UNDEFINED!!??' : `OK ${devTeamVesting.address}`);
  if (devTeamVesting === undefined) {
    devTeamVesting = await deployer.new(BalleDevTeamVesting, balleAddress, devTeamAddress[NUMBER]);
    console.log(devTeamVesting === undefined ? 'UNDEFINED!!??' : `OK ${devTeamVesting.address}`);
  }

  if (networkConfig['devTeamVestingAddress'] === undefined) {
    networkConfig['devTeamVestingAddress'] = [devTeamVesting.address];
  } else {
    networkConfig['devTeamVestingAddress'][NUMBER] = devTeamVesting.address;
  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
