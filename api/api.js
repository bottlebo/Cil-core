const axios = require('axios');
const configs = require('../config/api.config.json');

module.exports = (factory, factoryOptions) => {
  const {Converter} = factory;
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
      
      const data = Converter.toBlockDto(block, blockInfo);
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
      const data = arrUtxos.map(utxo => ({

        txHash: utxo.getTxHash(),
        arrIndexOutputs: utxo.getIndexes().map((index, i) => ({
          amount: utxo._data.arrOutputs[i].amount,
          receiverAddr: utxo._data.arrOutputs[i].receiverAddr.toString('hex'),
          index: index
        }))
      }));

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
      const data = arrContract.map(objContract => ({
        address: objContract.strContractAddr,
        code: objContract.contract.getCode(),
        data: JSON.stringify(objContract.contract.getData()),
        conciliumId: objContract.contract.getConciliumId(),
        balance: objContract.contract.getBalance()
      }));
      await axios.post('Contract', data)
        .catch(error => {
          console.log(error);
        });
    }
    async saveReceipts(arrReceipts) {
      let data = arrReceipts.map(obj => {
        let objReceipt = obj.receipt.toObject();
        let from = obj.from;
        if (objReceipt.internalTxns.length)
          return {
            internalTxns: [...objReceipt.internalTxns],
            coins: [...objReceipt.coins.map(coin => ({amount: coin.amount, receiverAddr: coin.receiverAddr.toString('hex')}))],
            from: from,
            coinsUsed: receipt.coinsUsed,
            status: receipt.status,
            message: receipt.message ? receipt.message : '',
            contractAddress: receipt.contractAddress.toString('hex')
          }
      });
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