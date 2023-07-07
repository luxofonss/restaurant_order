const Redis = require("ioredis");
const host = "localhost";
const port = 6379;
const db = 0;

class RedisRepo {
  constructor() {
    this.redis = new Redis({ port, host, db });
    this.redis.on("ready", () => {
      console.log("redis ready");
      this.redis.config("SET", "notify-keyspace-events", "Ex");
    });
  }

  get(key) {
    return this.redis.get(key);
  }

  del(key) {
    return this.redis.del(key);
  }

  setReminder(key, value, expire) {
    this.redis
      .multi()
      .set(key, value)
      .set(`reminder:${key}`, 1)
      .expire(`reminder:${key}`, expire)
      .exec();
  }
}

module.exports = RedisRepo;
