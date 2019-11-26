module.exports = (factory) => {
  const {Constants, Crypto, Block, Transaction, Inventory, ArrayOfHashes, Mutex} = factory;

  return class DtoSerializer {

    static toReceiptDto(obj) {
      let objReceipt = obj.receipt.toObject();
      let from = obj.from;
      if (objReceipt.internalTxns.length)
        return {
          internalTxns: [...objReceipt.internalTxns],
          coins: [...objReceipt.coins.map(coin => ({amount: coin.amount, receiverAddr: coin.receiverAddr.toString('hex')}))],
          from: from,
          coinsUsed: objReceipt.coinsUsed,
          status: objReceipt.status,
          message: objReceipt.message ? objReceipt.message : '',
          contractAddress: objReceipt.contractAddress.toString('hex')
        }
    }

    /**
     * 
     * @param {*} objContract 
     */
    static toContractDto(objContract) {
      return {
        address: objContract.strContractAddr,
        code: objContract.contract.getCode(),
        data: JSON.stringify(objContract.contract.getData()),
        conciliumId: objContract.contract.getConciliumId(),
        balance: objContract.contract.getBalance()
      }
    }

    /**
     * 
     * @param {Utxo} utxo 
     * @return {UtxoDto}
     */
    static toUtxoDto(utxo) {
      return {
        txHash: utxo.getTxHash(),
        arrIndexOutputs: utxo.getIndexes().map((index, i) => ({
          amount: utxo._data.arrOutputs[i].amount,
          receiverAddr: utxo._data.arrOutputs[i].receiverAddr.toString('hex'),
          index: index
        }))
      }
    }

    /**
     * 
     * @param {Block} block 
     * @param {BlockInfo} blockInfo 
     * @return {BlockDto}
     */
    static toBlockDto(block, blockInfo) {
      return {
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
    }
  }
};