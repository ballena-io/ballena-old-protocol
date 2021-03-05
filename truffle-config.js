/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const bscTestnetConfig = JSON.parse(fs.readFileSync(".env.bsc_testnet.json"));
const bscMainnetConfig = JSON.parse(fs.readFileSync(".env.bsc_mainnet.json"));

require('ts-node').register({
  files: true,
});

module.exports = {
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    bscscan: bscMainnetConfig.bscscanApiKey
  },
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    bsc_testnet: {
      provider: () => new HDWalletProvider(bscTestnetConfig.wallets, "https://data-seed-prebsc-1-s1.binance.org:8545/", 0, 2),
      network_id: 97,
      confirmations: 5,
      timeoutBlocks: 300000,
      skipDryRun: true
    },
    bsc_mainnet: {
      provider: () => new HDWalletProvider(bscMainnetConfig.wallets, "https://bsc-dataseed.binance.org/", 0, 2),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 1000,
      skipDryRun: true
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.7.4",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
       evmVersion: "byzantium"
      }
    }
  }
};
