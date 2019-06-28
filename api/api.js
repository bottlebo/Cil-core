const axios = require('axios');
const configs = require('../config/api.config.json');

module.exports = (factory, factoryOptions) => {
  const {Transaction} = factory;
  return class Api {
    constructor(options) {
      const config = configs[options.apiConfig];
      if (config) {
        axios.defaults.baseURL = config.baseURL;
      }
    }
    async saveBlock(block, blockInfo) {
      const data = {
        hash: block.getHash(),
        merkleRoot: block.merkleRoot.toString('hex'),
        conciliumId: block.conciliumId,
        timestamp: block.timestamp,
        height: block.getHeight(),
        version: 1,
        state: blockInfo ? blockInfo.getState() : null,
        parentHashes: block.parentHashes,
        signatures: block.signatures.map(signature => signature ? signature.toString('hex') : ''),
        txns: block.txns.map(objTx => {
          const tx = new Transaction(objTx);
          return {
            hash: tx.getHash(),
            version: objTx.payload.version,
            conciliumId: tx.conciliumId,
            status: 'stable',
            claimProofs: tx.claimProofs.map(proof => proof ? proof.toString('hex') : ''),
            inputs: tx.inputs.map(input => ({txHash: input.txHash.toString('hex'), nTxOutput: input.nTxOutput})),
            outputs: tx.outputs.map((out, index) => ({
              receiverAddr: out.receiverAddr ? out.receiverAddr.toString('hex') : null,
              addrChangeReceiver: out.addrChangeReceiver ? out.addrChangeReceiver.toString('hex') : null,
              contractCode: out.contractCode ? out.contractCode : null,
              amount: out.amount,
              nTx: index
            }))
          }
        })
      }
      //console.log(data);

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
      await axios.delete(`Utxo`, arrHash)
        .catch(error => {
          console.log(error);
        });
    }
  }
}