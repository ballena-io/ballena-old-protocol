const fs = require('fs');

const BulkSender = artifacts.require('BulkSender');

module.exports = async function (deployer, network, accounts) {
  // Load network config data
  const networkConfigFilename = `.env.${network}.json`;
  const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));

  // Deploy BulkSender contract
  await deployer.deploy(BulkSender);

  networkConfig['bulkSenderAddress'] = BulkSender.address;

  fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });

};
