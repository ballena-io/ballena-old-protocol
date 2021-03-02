const fs = require('fs');

const BALLE = artifacts.require("BALLE");
const WBNB = artifacts.require("WBNB");
const BalleTreasury = artifacts.require("BalleTreasury");
const RewardPool = artifacts.require("RewardPool");
const VaultRewardPool = artifacts.require("VaultRewardPool");

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

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
  // const treasuryAddress = treasury.address;

  // Deploy RewardPool contract
  await deployer.deploy(RewardPool, wbnbAddress, balleAddress, treasury.address);
  const rewardPool = await RewardPool.deployed();

  // Deploy VaultRewardPool contract
  await deployer.deploy(VaultRewardPool, balleAddress);
  const vaultRewardPool = await VaultRewardPool.deployed();

  networkConfig["treasuryAddress"] = treasury.address;
  networkConfig["rewardPoolAddress"] = rewardPool.address;
  networkConfig["vaultRewardPoolAddress"] = vaultRewardPool.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
