//Dumper = require('./dumper')

//
module.exports = (Transaction, Dumper) => {

  return class BlockDumper extends Dumper {
    constructor(options) {
      super(options);

      this.options = {
        ...options
      };
      this.path = 'blocks.dump'

      //console.log(this)
      //
    }
    async dump(block, blockInfo) {
      //...
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
      //
      await this._dump(data);
    }
  }
}