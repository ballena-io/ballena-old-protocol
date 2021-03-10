module.exports = async function main(callback) {
    try {
        //const accounts = web3.currentProvider.addresses
        const CakeLPStrategyV1 = artifacts.require('CakeLPStrategyV1');
        const strat = await CakeLPStrategyV1.at('0xC97a480ff201AA993De53F9211461e480e3c6494');

        await strat.harvest();

        callback(0);
    } catch (error) {
        console.error(error);
        callback(1);
    }
}
