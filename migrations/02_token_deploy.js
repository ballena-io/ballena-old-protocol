const BALLE = artifacts.require("BALLE");
const WBNB = artifacts.require("WBNB");

module.exports = async function (deployer, network, accounts) {
  if (network == "bsc_mainnet") {
    await deployer.deploy(BALLE, "ballena.io", "BALLE");

  } else {
    await deployer.deploy(BALLE, "bproject.io", "BTEST");
    const balleToken = await BALLE.deployed();
    await balleToken.addMinter(accounts[0]);

    if (network == "development") {
      // deploy mock token contracts
      await deployer.deploy(WBNB);
    }
  } 
};
