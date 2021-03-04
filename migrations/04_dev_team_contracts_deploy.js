const fs = require('fs');

const BalleDevTeamVesting = artifacts.require('BalleDevTeamVesting');
const BalleDevTeamTimelock = artifacts.require('BalleDevTeamTimelock');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  // Get addresses
  let devTeamAddress;
  let internalAddress;
  let internalReleaseTime;
  if (network == 'development') {
    devTeamAddress = accounts;
    internalAddress = accounts[1];
    internalReleaseTime = Math.round((new Date()).getTime() / 1000) + 300; // 5 mins. from now
    console.log('DEV TIME: ', internalReleaseTime);
  } else {
    // load from network config
    devTeamAddress = networkConfig.devTeamAddress;
    internalAddress = networkConfig.internalAddress;
    internalReleaseTime = networkConfig.internalReleaseTime;
  }
  const balleAddress = networkConfig.BALLE;

  let devTeamVestingAddress = new Array();
  let devTeamVesting;
  // Deploy 6 instances of BalleDevTeamVesting contract
  if (network == 'development') {
    // inexplicablemente, la primera creación devuelve 'undefined'
    devTeamVesting = await deployer.new(BalleDevTeamVesting, balleAddress, devTeamAddress[0]);
    console.log(devTeamVesting === undefined ? "UNDEFINED!!??" : "OK");
  }
  for (i=0; i < 6; i++) {
    devTeamVesting = await deployer.new(BalleDevTeamVesting, balleAddress, devTeamAddress[i]);
    console.log(devTeamVesting === undefined ? "UNDEFINED!!??" : "OK");
    devTeamVestingAddress[i] = devTeamVesting.address;
  }
  networkConfig['devTeamVestingAddress'] = devTeamVestingAddress;

  // Deploy BalleDevTeamTimelock contract
  await deployer.deploy(BalleDevTeamTimelock, balleAddress, internalAddress, internalReleaseTime);
  const devTeamTimelock = await BalleDevTeamTimelock.deployed();
  networkConfig['devTeamTimelockAddress'] = devTeamTimelock.address;
  networkConfig['internalReleaseTime'] = internalReleaseTime;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
