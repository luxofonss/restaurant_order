const { orderExpiredUpdate } = require("../models/repo/order.repo");
const PubSub = require("./pubsub");
const RedisRepo = require("./redis.repo");
const redisRepo = new RedisRepo();

function RedisExpiredEvents() {
  PubSub.subscribe("__keyevent@0__:expired");
  PubSub.on("message", async (channel, message) => {
    const [type, key] = message.split(":");
    switch (type) {
      case "reminder": {
        const value = await redisRepo.get(key);
        console.log("TYPE: ", type);
        console.log("KEY: ", key);
        console.log("VALUE: ", value);
        // update order status here!
        orderExpiredUpdate(key);
        redisRepo.del(key);
        break;
      }
    }
  });
}

module.exports = RedisExpiredEvents;
