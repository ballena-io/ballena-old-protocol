const BALLE = artifacts.require("BALLE");

module.exports = async function (deployer, network, accounts) {
  if (network == "bsc_mainnet") {
    await deployer.deploy(BALLE, "ballena.io", "BALLE");
  } else {
    await deployer.deploy(BALLE, "bproject.io", "BTEST");
    const balleToken = await BALLE.deployed();
    console.log('\n   > BALLE token deployment: Success -->', balleToken.address)
    await balleToken.addMinter(accounts[0]);
  } 
};
