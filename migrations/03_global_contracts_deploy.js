const fs = require('fs');

const BALLE = artifacts.require("BALLE");
const WBNB = artifacts.require("WBNB");
const BalleTreasury = artifacts.require("BalleTreasury");
const RewardPool = artifacts.require("RewardPool");
const VaultRewardPool = artifacts.require("VaultRewardPool");

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfig = JSON.parse(fs.readFileSync(`.env.${network}.json`));

  // Set external addresses
  var wbnbAddress;
  if (network == "development") {
    // mock contracts
    const wbnb = await WBNB.deployed();
    wbnbAddress = wbnb.address 
  } else {
    // load from network config
    wbnbAddress = networkConfig.wbnb;
  }
  const balle = await BALLE.deployed();
  const balleAddress = balle.address;

  // Deploy Treasury contract
  await deployer.deploy(BalleTreasury);
  const treasury = await BalleTreasury.deployed();
  const treasuryAddress = treasury.address;

  // Deploy RewardPool contract
  await deployer.deploy(RewardPool, wbnbAddress, balleAddress, treasuryAddress);

  // Deploy VaultRewardPool contract
  await deployer.deploy(VaultRewardPool, balleAddress);

};
