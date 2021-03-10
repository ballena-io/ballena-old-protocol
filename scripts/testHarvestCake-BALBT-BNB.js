module.exports = async function main(callback) {
    try {
        //const accounts = web3.currentProvider.addresses
        const CakeLPStrategyV1 = artifacts.require('CakeLPStrategyV1');
        const strat = await CakeLPStrategyV1.at('0x0fd79b1A24EC960de2B0106e9d19E7a44143CC8a');

        await strat.harvest();

        callback(0);
    } catch (error) {
        console.error(error);
        callback(1);
    }
}
