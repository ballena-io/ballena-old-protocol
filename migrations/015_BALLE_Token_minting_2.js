const fs = require('fs');

const BALLE = artifacts.require('BALLE');

module.exports = async function (deployer, network, accounts) {

  if (network != 'develop') {
    // Load network config data
    const networkConfigFilename = `.env.${network}.json`;
    const networkConfig = JSON.parse(fs.readFileSync(networkConfigFilename));
    let txRegistry = networkConfig.txRegistry;

    // Get addresses
    const balleAddress = networkConfig.BALLE;
    const devTeamVestingAddress = networkConfig.devTeamVestingAddress;

    const balleToken = await BALLE.at(balleAddress);

    for (i=0; i < devTeamVestingAddress.length - 1; i++) {
      let result = await balleToken.mint(devTeamVestingAddress[i], 400)
      console.log(`TX: ${result.tx}`);
      txRegistry.push(result.tx);
    }
    
    networkConfig['txRegistry'] = txRegistry;

    fs.writeFileSync(networkConfigFilename, JSON.stringify(networkConfig, null, 2), { flag: 'w' });
  }

};
