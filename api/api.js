const axios = require('axios');
const configs = require('../config/api.config.json');

module.exports = (factory, factoryOptions) => {
  const {DtoSerializer} = factory;
  return class Api {
    constructor(options) {
      const config = configs[options.apiConfig];
      if (config) {
        axios.defaults.baseURL = config.baseURL;
        if (options.apiUser && options.apiPassword) {
          const auth = 'Basic ' + new Buffer.from(options.apiUser + ':' + options.apiPassword).toString('base64');
          axios.defaults.headers.common['Authorization'] = auth;
        }
      }
    }
    async saveBlock(block, blockInfo) {

      const data = DtoSerializer.toBlockDto(block, blockInfo);
      await axios.post('Block', data)
        .catch(error => {
          console.log(error);
        });
    }
    async setBlockState(hash, state) {
      await axios.post(`State/${hash}`, {state})
        .catch(error => {
          console.log(error);
        });
    }
    async removeBlock(blockHash) {
      await axios.delete(`Block/${blockHash}`)
        .catch(error => {
          console.log(error);
        });
    }
    async saveUtxos(arrUtxos) {
      const data = arrUtxos.map(utxo => DtoSerializer.toUtxoDto(utxo));
      await axios.post('Utxo', data)
        .catch(error => {
          console.log(error);
        });
    }
    async deleteUtxos(arrHash) {
      await axios.delete(`Utxo`, {data: arrHash})
        .catch(error => {
          console.log(error);
        });
    }
    async saveContracts(arrContract) {

      const data = arrContract.map(objContract => DtoSerializer.toContractDto(objContract));
      await axios.post('Contract', data)
        .catch(error => {
          console.log(error);
        });
    }
    async saveReceipts(arrReceipts) {
      let data = arrReceipts.map(obj => DtoSerializer.toReceiptDto(obj));
      data = data.filter(r => r)
      if (data.length) {
        await axios.post('Receipt', data)
          .catch(error => {
            console.log(error);
          });
      }
    }
  }
}