const fs = require('fs');

const BALLE = artifacts.require("BALLE");
const BalleDevTeamVesting = artifacts.require("BalleDevTeamVesting");
const BalleDevTeamTimelock = artifacts.require("BalleDevTeamTimelock");

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  // Set external addresses
  var devTeamAddress;
  var internalAddress;
  var internalReleaseTime;
  if (network == "development") {
    devTeamAddress = accounts;
    internalAddress = accounts[1];
    internalReleaseTime = Math.round((new Date()).getTime() / 1000) + 300; // 5 mins. from now
    console.log("TIME: ", internalReleaseTime);
  } else {
    // load from network config
    devTeamAddress = networkConfig.devTeamAddress;
    internalAddress = networkConfig.internalAddress;
    internalReleaseTime = networkConfig.internalReleaseTime;
  }

  const balle = await BALLE.deployed();
  const balleAddress = balle.address;

  var devTeamVestingAddress = new Array();
  // Deploy 6 instances of BalleDevTeamVesting contract
  for (i=0;i<6;i++) {
    var devTeamVesting = await deployer.new(BalleDevTeamVesting, balleAddress, devTeamAddress[i]);
    devTeamVestingAddress[i] = devTeamVesting.address;
  }
  networkConfig["devTeamVestingAddress"] = devTeamVestingAddress;

  // Deploy BalleDevTeamTimelock contract
  await deployer.deploy(BalleDevTeamTimelock, balleAddress, internalAddress, internalReleaseTime);
  const devTeamTimelock = await BalleDevTeamTimelock.deployed();
  networkConfig["devTeamTimelockAddress"] = devTeamTimelock.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
