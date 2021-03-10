const fs = require('fs');

const BalleTreasury = artifacts.require('BalleTreasury');

module.exports = async function (deployer, network, accounts) {

  if (network != 'develop') {
    // Load network config data
    const networkConfigFilename = `.env.${network}.json`;
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
    let txRegistry = networkConfig.txRegistry;
    const COMMOMN_SAFE = '0x0b56828DfA6fe4144B8619c0f66b9FD594766c29';

    // Get addresses
    const treasuryAddress = networkConfig.treasuryAddress;

    const treasury = await BalleTreasury.at(treasuryAddress);

    let result = await treasury.transferOwnership(COMMOMN_SAFE);
    console.log(`TX: ${result.tx}`);
    txRegistry.push(result.tx);

    networkConfig['txRegistry'] = txRegistry;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  }
  
};
