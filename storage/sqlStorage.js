const sql = require('mssql/tedious');
const connectionString = 'mssql://cil:1234567890@localhost/cilstorage?driver=tedious';

module.exports = (factory, factoryOptions) => {
  const {
    Constants, Block, BlockInfo, UTXO, ArrayOfHashes, ArrayOfAddresses, Contract,
    TxReceipt, WitnessGroupDefinition, Peer, PatchDB, Transaction
  } = factory;
  return class SqlStorage {
    constructor(options) {
      options = {
        ...factoryOptions,
        ...options
      };
    }
    //
    async saveBlock(block) {
      const hash = block.getHash();
      const merkleRoot = block.merkleRoot.toString('hex');
      const command = `INSERT INTO Blocks (Hash, MerkleRoot, WitnessGroupId, Timestamp, Version, State)` +
        ` VALUES('${hash}', '${merkleRoot}', ${block.witnessGroupId}, ${block.timestamp}, 1, 0)`;
      await sql.connect(connectionString)
      await sql.query(command)
      await Promise.all(
        block.parentHashes.map(async parent => await sql.query(`INSERT INTO ParentHashes (BlockHash, ParentHash) VALUES ('${hash}', '${parent}')`))
      );
      //
      await Promise.all(
        block.signatures.map(async signature => await sql.query(`INSERT INTO Signatures (BlockHash, Signature) VALUES ('${hash}', '${signature}')`))
      );
      await Promise.all(
        block.txns.map(async objTx => {
          const tx = new Transaction(objTx);
          await sql.query(`INSERT INTO Transactions (Hash, BlockHash, Version, WitnessGroupId, Status) VALUES ('${tx.getHash()}','${hash}', 1, ${tx.witnessGroupId},'')`);
          
          await Promise.all(
            tx.claimProofs.map(async proof => {
              await sql.query(`INSERT INTO ClaimProofs (TransactionHash, Proof) VALUES ('${tx.getHash()}', '${proof}')`)
            })
          );

          await Promise.all(
            tx.inputs.map(async input => {
              const txHash = input.txHash.toString('hex');
              await sql.query(`INSERT INTO Inputs (TransactionHash, TxHash, nTxOutput) VALUES ('${tx.getHash()}', '${txHash}', ${input.nTxOutput})`)
            })
          );
          await Promise.all(
            tx.outputs.map(async out => {
              const receiverAddr = out.receiverAddr ? out.receiverAddr.toString('hex') : '';
              const addrChangeReceiver = out.addrChangeReceiver ? out.addrChangeReceiver.toString('hex') : null;
              const contractCode = out.contractCode ? out.contractCode : null;
              await sql.query(`INSERT INTO Outputs (TransactionHash, ReceiverAddr, AddrChangeReceiver, Amount, ContractCode )
                 VALUES ('${tx.getHash()}', '${receiverAddr}', '${addrChangeReceiver}', ${out.amount}, ${contractCode})
                `);
            })
          );
        })
      );

      sql.close();
    }
    async removeBlock(blockHash) {
      const command = `DELETE FROM Blocks WHERE Hash='${blockHash}'`;
      await sql.connect(connectionString)
      await sql.query(command)
      sql.close();
    }
    async saveUtxos(arrUtxos) {
      let utxoId;
      await sql.connect(connectionString);
      await Promise.all(
        arrUtxos.map(async utxo => {
          const txHash = utxo._txHash.toString('hex');
          let result = await sql.query(`SELECT Id FROM Utxo WHERE TransactionHash='${txHash}'`);
          if (result.recordset.length) {
            utxoId = result.recordset[0].Id;
            await sql.query(`DELETE FROM UtxoIndices WHERE UtxoId = ${utxoId}`);
            await sql.query(`DELETE FROM UtxoOutputs WHERE UtxoId = ${utxoId}`);

          }
          else {
            result = await sql.query(`INSERT INTO Utxo (TransactionHash) OUTPUT Inserted.Id VALUES ('${txHash}')`);
          }
            utxoId = result.recordset[0].Id;
            await Promise.all(
              utxo.getIndexes().map(async index => {
                await sql.query(`INSERT INTO UtxoIndices (UtxoId, [Index]) VALUES (${utxoId}, ${index})`)
              })
            )
            await Promise.all(
              utxo._data.arrOutputs.map(async out => {
                const receiverAddr = out.receiverAddr.toString('hex');
                await sql.query(`INSERT INTO UtxoOutputs (UtxoId, Amount, ReceiverAddr) VALUES (${utxoId}, ${out.amount}, '${receiverAddr}')`)
              })
            )
        })
      );
      sql.close();
    }
    async deleteUtxos(arrHash) {
      await sql.connect(connectionString);
      await Promise.all(
        arrHash.map(async hash => {
          await sql.query(`DELETE FROM Utxo WHERE TransactionHash=${hash}`);
        })
      )
      sql.close();
    }
  }
}