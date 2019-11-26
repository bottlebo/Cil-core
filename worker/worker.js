const path = require('path');
const DUMP_PATH_PREFIX = './swap';
const DUMP_INTERVAL = 1000;
const Tick = require('tick-tock');
var fs = require('fs-ext');

module.exports = (Mutex) => {

  return class Worker {
    constructor(options, file, timername) {
      options = {
        ...options
      };
      const {dumpPath} = options;
      this._pathPrefix = path.resolve(dumpPath || DUMP_PATH_PREFIX);
      this._path = `${this._pathPrefix}/${file}`;
      this._fd = null;
      this._pool = [];
      this._locked = false;
      this._timerName = timername;

      this._mutex = new Mutex();
      this._dumpTimer = new Tick(this);
      if (this._timerName) {
        this._dumpTimer.setInterval(this._timerName, this._flush, DUMP_INTERVAL);
      }
    }
    set path(file) {
      this._path = `${this._pathPrefix}/${file}`;
    }
    async _dump(obj) {
      const _lock = await this._mutex.acquire('pool');
      this._pool.push(JSON.stringify(obj));
      this._mutex.release(_lock);
    }
    async _dumpArray(arrObj) {
      const _lock = await this._mutex.acquire('pool');
      for (const obj of arrObj) {
        this._pool.push(JSON.stringify(obj));
      }
      this._mutex.release(_lock);
    }
    async _flush() {
      if (this._locked) return;
      if (this._pool.length) {
        let _pool = [];

        const _lock = await this._mutex.acquire('pool');
        _pool = [...this._pool];
        this._pool = [];
        this._mutex.release(_lock);
        try {
          this._fd = fs.openSync(this._path, 'a+');
          this._locked = true;
          fs.flock(this._fd, 'ex', async (err) => {
            if (err) {
              console.log('-Error:', err);
              const _lock = await this._mutex.acquire('pool');
              this._pool = _pool.concat(this._pool);
              this._mutex.release(_lock);
            }
            else {
              fs.appendFile(this._fd, _pool.join('\n') + '\n', async (err) => {
                if (err) {
                  console.log('*Error:', err)
                  const _lock = await this._mutex.acquire('pool');
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
          const _lock = await this._mutex.acquire('pool');
          this._pool = _pool.concat(this._pool);
          this._mutex.release(_lock);

          if (this._fd) fs.closeSync(this._fd);
          console.log('Error:', err)
        }
      }
    }
  }
}