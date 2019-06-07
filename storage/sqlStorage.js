const sql = require('mssql/tedious');
const assert = require('assert');
const configs = require('../config/sqlserver.config.json');

module.exports = (factory, factoryOptions) => {
    const {Transaction} = factory;
    return class SqlStorage {
        constructor(options) {
            const config = configs[options.sqlConfig];
            assert(config, `No config found for sqlConfig=${options.sqlConfig}`);

            this.pool = new sql.ConnectionPool(config);
            this.pool.on('error', err => { console.log(err); });
            this.pool.close();
            this.connPromise = this.pool.connect();
        }

        async saveBlock(block) {
            await this.connPromise;
            const hash = block.getHash();
            const merkleRoot = block.merkleRoot.toString('hex');
            const command = `INSERT INTO Blocks (Hash, MerkleRoot, ConciliumId, Timestamp, Version, State, [Height])` +
                            ` VALUES('${hash}', '${merkleRoot}', ${block.conciliumId}, ${block.timestamp}, 1, 0, ${block.getHeight()})`;
            const request = new sql.Request(this.pool);
            await request.query(command).catch(err => console.log(err));
            await Promise.all(
                block.parentHashes.map(async parent => {
                    const request = new sql.Request(this.pool);
                    await request.query(
                        `INSERT INTO ParentHashes (BlockHash, ParentHash) VALUES ('${hash}', '${parent}')`)
                        .catch(err => console.log(err));
                })
            );

            await Promise.all(
                block.signatures.map(async sig => {
                    const request = new sql.Request(this.pool);
                    const signature = sig ? sig.toString('hex') : '';
                    await request.query(
                        `INSERT INTO Signatures (BlockHash, Signature) VALUES ('${hash}', '${signature}')`)
                        .catch(err => console.log(err));
                })
            );

            await Promise.all(
                block.txns.map(async objTx => {

                    const tx = new Transaction(objTx);
                    if (tx.outputs && tx.outputs.length) {
                        const request = new sql.Request(this.pool);
                        await request.query(
                            `INSERT INTO Transactions (Hash, BlockHash, Version, ConciliumId, Status) VALUES ('${tx.getHash()}','${hash}', 1, ${tx.conciliumId},'stable')`)
                            .catch(err => console.log(err));

                        await Promise.all(
                            tx.claimProofs.map(async proof => {
                                const request = new sql.Request(this.pool);
                                const claimProof = proof ? proof.toString('hex') : '';
                                await request.query(
                                    `INSERT INTO ClaimProofs (TransactionHash, Proof) VALUES ('${tx.getHash()}', '${claimProof}')`)
                                    .catch(err => console.log(err));
                            })
                        );

                        await Promise.all(
                            tx.inputs.map(async input => {
                                const request = new sql.Request(this.pool);
                                const txHash = input.txHash.toString('hex');
                                await request.query(
                                    `INSERT INTO Inputs (TransactionHash, TxHash, nTxOutput) VALUES ('${tx.getHash()}', '${txHash}', ${input.nTxOutput})`)
                                    .catch(err => console.log(err));
                            })
                        );

                        await Promise.all(
                            tx.outputs.map(async (out, index) => {
                                const request = new sql.Request(this.pool);
                                const receiverAddr = out.receiverAddr ? out.receiverAddr.toString('hex') : '';
                                const addrChangeReceiver = out.addrChangeReceiver ? out.addrChangeReceiver.toString(
                                    'hex') : null;
                                const contractCode = out.contractCode ? 'contract' : null;
                                await request.query(
                                    `INSERT INTO Outputs (TransactionHash, ReceiverAddr, AddrChangeReceiver, Amount, ContractCode, NTx ) VALUES ('${tx.getHash()}', '${receiverAddr}', '${addrChangeReceiver}', ${out.amount}, '${contractCode}', ${index})`)
                                    .catch(err => console.log(err));
                            })
                        );
                    }
                })
            );
        }

        async removeBlock(blockHash) {
            await this.connPromise;

            const request = new sql.Request(this.pool);
            const command = `DELETE FROM Blocks WHERE Hash='${blockHash}'`;
            await request.query(command).catch(err => console.log(err));
        }

        async saveUtxos(arrUtxos) {
            await this.connPromise;

            await Promise.all(
                arrUtxos.map(async utxo => {
                    let utxoId;
                    const request = new sql.Request(this.pool);
                    const txHash = utxo._txHash.toString('hex');
                    let result = await request.query(`SELECT Id FROM Utxo WHERE TransactionHash='${txHash}'`)
                        .catch(err => console.log(err));
                    if (result.recordset.length) {
                        utxoId = result.recordset[0].Id;
                        await request.query(`DELETE FROM UtxoIndexOutputs WHERE UtxoId = ${utxoId}`)
                            .catch(err => console.log(err.originalError.info));

                    } else {
                        result = await request.query(
                            `INSERT INTO Utxo (TransactionHash) OUTPUT Inserted.Id VALUES ('${txHash}')`)
                            .catch(err => console.log(err));
                    }
                    utxoId = result.recordset[0].Id;
                    await Promise.all(
                        utxo.getIndexes().map(async (index, i) => {
                            const request = new sql.Request(this.pool);
                            const amount = utxo._data.arrOutputs[i].amount;
                            const receiverAddr = utxo._data.arrOutputs[i].receiverAddr.toString('hex');
                            await request.query(
                                `INSERT INTO UtxoIndexOutputs (UtxoId, [Index], Amount, ReceiverAddr) VALUES (${utxoId}, ${index}, ${amount}, '${receiverAddr}')`)
                                .catch(err => console.log(err));
                        })
                    );
                })
            );
        }

        async deleteUtxos(arrHash) {
            await this.connPromise;

            await Promise.all(
                arrHash.map(async hash => {
                    const request = new sql.Request(this.pool);

                    await request.query(`DELETE FROM Utxo WHERE TransactionHash='${hash}'`)
                        .catch(err => console.log(err));
                })
            );
        }
    };
};
