const fs = require('fs');

const BalleDevTeamTimelock = artifacts.require('BalleDevTeamTimelock');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  // Get addresses
  let internalAddress;
  let internalReleaseTime;
  if (network == 'development') {
    internalAddress = accounts[1];
    internalReleaseTime = Math.round((new Date()).getTime() / 1000) + 300; // 5 mins. from now
    console.log('DEV TIME: ', internalReleaseTime);
  } else {
    // load from network config
    internalAddress = networkConfig.internalAddress;
    internalReleaseTime = networkConfig.internalReleaseTime;
  }
  const balleAddress = networkConfig.BALLE;

  // Deploy BalleDevTeamTimelock contract
  await deployer.deploy(BalleDevTeamTimelock, balleAddress, internalAddress, internalReleaseTime);
  const devTeamTimelock = await BalleDevTeamTimelock.deployed();
  networkConfig['devTeamTimelockAddress'] = devTeamTimelock.address;
  networkConfig['internalReleaseTime'] = internalReleaseTime;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
