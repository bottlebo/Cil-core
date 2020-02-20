const path = require('path');
const DUMP_PATH_PREFIX = './swap';
const fs = require('fs');
const configs = require('../config/worker.config.json');

module.exports = (Mutex) => {

  return class Worker {
    constructor(options, key) {
      let _dumpPath, _dumpInterval;
      const config = configs[options.workerConfig];
      if (config) {
        _dumpPath = config.dumpPath;
        _dumpInterval = config.dumpInterval;
      }
      this._pathPrefix = path.resolve(_dumpPath || DUMP_PATH_PREFIX);
      this._key = key;
      this._lockName = `${key}_lock`;
      this._pool = [];
      this._locked = false;

      this._mutex = new Mutex();
    }
    async _dumpObj(obj) {
      const _lock = await this._mutex.acquire(this._lockName);
      this._pool.push(JSON.stringify(obj));
      this._mutex.release(_lock);
    }
    async _dumpStr(str) {
      const _lock = await this._mutex.acquire(this._lockName);
      this._pool.push(str);
      this._mutex.release(_lock);
    }
    async _dumpObjectArray(arrObj) {
      const _lock = await this._mutex.acquire(this._lockName);
      for (const obj of arrObj) {
        this._pool.push(JSON.stringify(obj));
      }
      this._mutex.release(_lock);
    }
    async _dumpStrArray(arrStr) {
      const _lock = await this._mutex.acquire(this._lockName);
      for (const str of arrStr) {
        this._pool.push(str);
      }
      this._mutex.release(_lock);
    }
    async flush() {
        if (this._locked) return;
        if (this._pool.length) {
          let _pool = [];

          const _lock = await this._mutex.acquire(this._lockName);
          _pool = [...this._pool];
          this._pool = [];
          this._mutex.release(_lock);
          try {
            this._locked = true;
            fs.writeFile(`${this._pathPrefix}/${Date.now().toString()}_${this._key}.dump`, _pool.join('\n'), async (err) => {
              if (err) {
                console.log('Error:', err);
                const _lock = await this._mutex.acquire(this._lockName);
                this._pool = _pool.concat(this._pool);
                this._mutex.release(_lock);
                this._locked = false;
                return
              }
              this._locked = false;
            });
          }
          catch (err) {
            const _lock = await this._mutex.acquire(this._lockName);
            this._pool = _pool.concat(this._pool);
            this._mutex.release(_lock);
            console.log('Error:', err);
          }
        }
    }
  }
}