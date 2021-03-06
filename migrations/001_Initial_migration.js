const fs = require('fs');

const Migrations = artifacts.require('Migrations');

module.exports = async function (deployer, network, accounts) {
    // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  if (network == 'develop') {
    // environment for tests
    
    await deployer.deploy(Migrations);

  } else {

    await deployer.deploy(Migrations);
    
    networkConfig['txRegistry'] = [Migrations.transactionHash];
    networkConfig['migrationsAddress'] = Migrations.address;

  }

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
