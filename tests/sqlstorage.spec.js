const {describe, it} = require('mocha');
const {assert} = require('chai');
const sinon = require('sinon').createSandbox();
const {createDummyTx, pseudoRandomBuffer, createDummyBlock, generateAddress} = require('./testUtil');

const factory = require('./testFactory');
describe('Storage tests', () => {
  before(async function() {
    await factory.asyncLoad();
  });

  // it('should create storage', async () => {
  //   const wrapper = () => new factory.SqlStorage();
  //   assert.doesNotThrow(wrapper);
  // });

  // it('should save block.', async () => {
  //   const block = createDummyBlock(factory);
  //   const storage = new factory.SqlStorage();
  //   await storage.saveBlock(block);
  // });

  // it('should save/delete block.', async () => {
  //   const block = createDummyBlock(factory);
  //   const storage = new factory.SqlStorage();
  //   await storage.saveBlock(block);
  //   const hash = block.getHash();
  //   await storage.removeBlock(hash)
  // });

  

  // it('should save UTXO', async () => {
  //   const storage = new factory.Storage();

  //   const hash = 'a9f3c6f88102000000000000000000000000000000000000ffffffffffffffff';
  //   //pseudoRandomBuffer();
  //   const coins = new factory.Coins(1e5, generateAddress());
  //   const utxo = new factory.UTXO({txHash: hash});
  //   utxo.addCoins(0, coins);
  //   const patch = new factory.PatchDB();
  //   patch.setUtxo(utxo);
  //   await storage.applyPatch(patch);
  // });

  // it('should get UTXO', async () => {
  //   const storage = new factory.SqlStorage();
  //   const hash = pseudoRandomBuffer();
  //   const coins = new factory.Coins(1e5, generateAddress());
  //   const utxo = new factory.UTXO({txHash: hash});
  //   utxo.addCoins(0, coins);
  //   storage.saveUtxos([utxo, utxo])
  // });
});