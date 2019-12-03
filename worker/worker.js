const path = require('path');
const DUMP_PATH_PREFIX = './swap';
const DUMP_INTERVAL = 1000;
const Tick = require('tick-tock');
const fs = require('fs-ext');
const configs = require('../config/worker.config.json');

module.exports = (Mutex) => {

  return class Worker {
    constructor(options, key) {
      let _dumpPath, _dumpInterval;
      const config = configs[options.workerConfig];
      if(config) {
        _dumpPath = config.dumpPath;
        _dumpInterval = config.dumpInterval;
      }
      this._pathPrefix = path.resolve(_dumpPath || DUMP_PATH_PREFIX);
      this._path = `${this._pathPrefix}/${key}.dump`;
      this._lockName = `${key}_lock`;
      this._fd = null;
      this._pool = [];
      this._locked = false;

      this._mutex = new Mutex();
      this._dumpTimer = new Tick(this);
      this._dumpTimer.setInterval(`${key}_timer`, this._flush, _dumpInterval || DUMP_INTERVAL);
    }
    async _dump(obj) {
      const _lock = await this._mutex.acquire(this._lockName);
      this._pool.push(JSON.stringify(obj));
      this._mutex.release(_lock);
    }
    async _dumpArray(arrObj) {
      const _lock = await this._mutex.acquire(this._lockName);
      for (const obj of arrObj) {
        this._pool.push(JSON.stringify(obj));
      }
      this._mutex.release(_lock);
    }
    async _flush() {
      if (this._locked) return;
      if (this._pool.length) {
        let _pool = [];

        const _lock = await this._mutex.acquire(this._lockName);
        _pool = [...this._pool];
        this._pool = [];
        this._mutex.release(_lock);
        try {
          this._fd = fs.openSync(this._path, 'a+');
          this._locked = true;
          fs.flock(this._fd, 'ex', async (err) => {
            if (err) {
              console.log('Error:', err);
              const _lock = await this._mutex.acquire(this._lockName);
              this._pool = _pool.concat(this._pool);
              this._mutex.release(_lock);
            }
            else {
              fs.appendFile(this._fd, _pool.join('\n') + '\n', async (err) => {
                if (err) {
                  console.log('Error:', err)
                  const _lock = await this._mutex.acquire(this._lockName);
                  this._pool = _pool.concat(this._pool);
                  this._mutex.release(_lock);
                }
                fs.flockSync(this._fd, 'un')
                this._locked = false;
                fs.closeSync(this._fd);
              });
            }
          });
        }
        catch (err) {
          const _lock = await this._mutex.acquire(this._lockName);
          this._pool = _pool.concat(this._pool);
          this._mutex.release(_lock);

          if (this._fd) fs.closeSync(this._fd);
          console.log('Error:', err)
        }
      }
    }
  }
}