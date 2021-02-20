const BALLE = artifacts.require("BALLE");

module.exports = async function (deployer, network, accounts) {
  if (network == "bsc") {
    await deployer.deploy(BALLE, "ballena.io", "BALLE");
  } else {
    await deployer.deploy(BALLE, "bproject.io", "BTEST");    
  } 
};
