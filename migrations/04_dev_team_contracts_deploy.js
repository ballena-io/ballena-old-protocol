const fs = require('fs');

const BALLE = artifacts.require("BALLE");
const BalleDevTeamVesting = artifacts.require("BalleDevTeamVesting");
const BalleDevTeamTimelock = artifacts.require("BalleDevTeamTimelock");

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfig = JSON.parse(fs.readFileSync(`.env.${network}.json`));

  // Set external addresses
  const devTeamAddress;
  const internalAddress;
  const internalReleaseTime;
  if (network == "development") {
    devTeamAddress = accounts;
    internalAddress = accounts[1];
  } else {
    // load from network config
    devTeamAddress = networkConfig.devTeamAddress;
    internalAddress = networkConfig.internalAddress;
  }
  internalReleaseTime = networkConfig.internalReleaseTime;
  const balle = await BALLE.deployed();
  const balleAddress = balle.address;

  // Deploy 6 instances of BalleDevTeamVesting contract
  for (i=0;i<6;i++) {
    await deployer.deploy(BalleDevTeamVesting, balleAddress, devTeamAddress[i]);
  }
  const devTeamVesting = await BalleDevTeamVesting.deployed();
  console.log('BalleDevTeamVesting found by Truffle: ', devTeamVesting)

  // Deploy BalleDevTeamTimelock contract
  await deployer.deploy(BalleDevTeamTimelock, balleAddress, internalAddress, internalReleaseTime);

};
