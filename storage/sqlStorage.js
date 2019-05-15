const sql = require('mssql/tedious');
const connectionString = 'mssql://cil:1234567890@localhost/cilstorage?driver=tedious';
const config = {
  user: 'cil',
  password: '1234567890',
  server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
  database: 'cilstorage',

  // options: {
  //     encrypt: true // Use this if you're on Windows Azure
  // }
}
module.exports = (factory, factoryOptions) => {
  const {Transaction} = factory;
  return class SqlStorage {
    constructor(options) {
      options = {
        ...factoryOptions,
        ...options
      };
      this.pool = new sql.ConnectionPool(config);
      this.pool.on('error', err => { console.log(err)});
      this.pool.close();
      this.connPromise = this.pool.connect();
    }
    //
    async saveBlock(block) {
      await this.connPromise;
      const hash = block.getHash();

      const merkleRoot = block.merkleRoot.toString('hex');
      const command = `INSERT INTO Blocks (Hash, MerkleRoot, WitnessGroupId, Timestamp, Version, State)` +
        ` VALUES('${hash}', '${merkleRoot}', ${block.witnessGroupId}, ${block.timestamp}, 1, 0)`;
      const request = new sql.Request(this.pool);
      await request.query(command).catch(err => console.log(err.originalError.info))
      await Promise.all(
        block.parentHashes.map(async parent =>
          await request.query(`INSERT INTO ParentHashes (BlockHash, ParentHash) VALUES ('${hash}', '${parent}')`)
            .catch(err => console.log(err.originalError.info))
        )
      );

      await Promise.all(
        block.signatures.map(async sig => {
          const signature = sig ? sig.toString('hex') : '';
          await request.query(`INSERT INTO Signatures (BlockHash, Signature) VALUES ('${hash}', '${signature}')`)
            .catch(err => console.log(err.originalError.info));
        })
      );

      await Promise.all(
        block.txns.map(async objTx => {
          const tx = new Transaction(objTx);
          await request.query(`INSERT INTO Transactions (Hash, BlockHash, Version, WitnessGroupId, Status) VALUES ('${tx.getHash()}','${hash}', 1, ${tx.witnessGroupId},'')`)
            .catch(err => console.log(err.originalError.info));

          await Promise.all(
            tx.claimProofs.map(async proof => {
              const claimProof = proof ? proof.toString('hex') : '';
              await request.query(`INSERT INTO ClaimProofs (TransactionHash, Proof) VALUES ('${tx.getHash()}', '${claimProof}')`)
                .catch(err => console.log(err.originalError.info));
            })
          );

          await Promise.all(
            tx.inputs.map(async input => {
              const txHash = input.txHash.toString('hex');
              await request.query(`INSERT INTO Inputs (TransactionHash, TxHash, nTxOutput) VALUES ('${tx.getHash()}', '${txHash}', ${input.nTxOutput})`)
                .catch(err => console.log(err.originalError.info));
            })
          );

          await Promise.all(
            tx.outputs.map(async out => {
              const receiverAddr = out.receiverAddr ? out.receiverAddr.toString('hex') : '';
              const addrChangeReceiver = out.addrChangeReceiver ? out.addrChangeReceiver.toString('hex') : null;
              const contractCode = out.contractCode ? out.contractCode : null;
              await request.query(`INSERT INTO Outputs (TransactionHash, ReceiverAddr, AddrChangeReceiver, Amount, ContractCode ) VALUES ('${tx.getHash()}', '${receiverAddr}', '${addrChangeReceiver}', ${out.amount}, ${contractCode})`)
                .catch(err => console.log(err.originalError.info));

            })
          );
        })
      );
    }
    async removeBlock(blockHash) {
      await this.connPromise;
      const request = new sql.Request(this.pool);

      const command = `DELETE FROM Blocks WHERE Hash='${blockHash}'`;
      await request.query(command).catch(err => console.log(err.originalError.info));
    }

    async saveUtxos(arrUtxos) {
      await this.connPromise;
      const request = new sql.Request(this.pool);

      let utxoId;
      await Promise.all(
        arrUtxos.map(async utxo => {
          const txHash = utxo._txHash.toString('hex');
          let result = await request.query(`SELECT Id FROM Utxo WHERE TransactionHash='${txHash}'`)
                                    .catch(err => console.log(err.originalError.info));
          if (result.recordset.length) {
            utxoId = result.recordset[0].Id;
            await request.query(`DELETE FROM UtxoIndices WHERE UtxoId = ${utxoId}`)
                         .catch(err => console.log(err.originalError.info));
            await request.query(`DELETE FROM UtxoOutputs WHERE UtxoId = ${utxoId}`)
                         .catch(err => console.log(err.originalError.info));

          }
          else {
            result = await request.query(`INSERT INTO Utxo (TransactionHash) OUTPUT Inserted.Id VALUES ('${txHash}')`)
                                  .catch(err => console.log(err.originalError.info));
          }
          utxoId = result.recordset[0].Id;
          await Promise.all(
            utxo.getIndexes().map(async index => {
              await request.query(`INSERT INTO UtxoIndices (UtxoId, [Index]) VALUES (${utxoId}, ${index})`)
                           .catch(err => console.log(err.originalError.info));
            })
          )
          await Promise.all(
            utxo._data.arrOutputs.map(async out => {
              const receiverAddr = out.receiverAddr.toString('hex');
              await request.query(`INSERT INTO UtxoOutputs (UtxoId, Amount, ReceiverAddr) VALUES (${utxoId}, ${out.amount}, '${receiverAddr}')`)
                           .catch(err => console.log(err.originalError.info));
            })
          )
        })
      );
    }
    async deleteUtxos(arrHash) {
      await this.connPromise;
      const request = new sql.Request(this.pool);

      await Promise.all(
        arrHash.map(async hash => {
          await request.query(`DELETE FROM Utxo WHERE TransactionHash=${hash}`).catch(err => console.log(err.originalError.info));
        })
      );
    }
  }
}