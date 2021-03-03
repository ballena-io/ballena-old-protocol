const fs = require('fs');

const BALLE = artifacts.require("BALLE");
const WBNB = artifacts.require("WBNB");
const TKNA = artifacts.require("TKNA");
const TKNB = artifacts.require("TKNB");

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  var balleToken;
  if (network == "bsc_mainnet") {
    await deployer.deploy(BALLE, "ballena.io", "BALLE");
    balleToken = await BALLE.deployed();

  } else {
    await deployer.deploy(BALLE, "bproject.io", "BTEST");
    balleToken = await BALLE.deployed();
    await balleToken.addMinter(accounts[0]);

    if (network == "development") {
      // deploy mock token contracts
      await deployer.deploy(WBNB);
      wbnb = await WBNB.deployed();
      await deployer.deploy(TKNA);
      tokenA = await TKNA.deployed();
      await deployer.deploy(TKNB);
      tokenB = await TKNB.deployed();
      
      networkConfig["WBNB"] = wbnb.address;
      networkConfig["TKNA"] = tokenA.address;
      networkConfig["TKNB"] = tokenB.address;
    }
  } 
  networkConfig["BALLE"] = balleToken.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
