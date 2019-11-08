const DumperWrapper = require('./dumper');
const BlockDumperWrapper = require('./blockDumper');

module.exports = (factory) => {
  const {Constants, Crypto, Block, Transaction, Inventory, ArrayOfHashes, Mutex} = factory;
  const Dumper = DumperWrapper(Mutex);
  return {
    Dumper,
    BlockDumper: BlockDumperWrapper(Transaction, Dumper)
  }
};