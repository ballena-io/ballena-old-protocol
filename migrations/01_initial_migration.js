const fs = require('fs');

const Migrations = artifacts.require("Migrations");

module.exports = async function (deployer, network, accounts) {
    // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  await deployer.deploy(Migrations);
  const migrations = await Migrations.deployed();
  networkConfig["migrationsAddress"] = migrations.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
