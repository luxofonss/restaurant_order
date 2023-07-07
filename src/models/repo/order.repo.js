"use strict";

const { Types } = require("mongoose");
const order = require("../order");
const RedisRepo = require("../../redis/redis.repo");

async function orderExpiredUpdate(id) {
  return await order
    .findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        status: "Cancelled",
      }
    )
    .exec();
}

async function orderPaymentSuccessfully(id) {
  const redis = new RedisRepo();
  //delete value redis
  await redis.del(id);
  await redis.del(`reminder:${id}`);
  //update dbs
  return await order
    .findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        status: "Paid",
      }
    )
    .exec();
}

async function checkIfAvailable({ tableId, startTime, endTime }) {
  const startTimeISOS = new Date(startTime);
  const endTimeISOS = new Date(endTime);
  console.log(startTimeISOS, endTimeISOS);
  const result1 = await order.findOne({
    tableId: new Types.ObjectId(tableId),
    startTime: { $lte: startTimeISOS },
    endTime: { $gte: startTimeISOS },
    status: { $in: ["Paid", "Created"] },
  });
  const result2 = await order.findOne({
    tableId: new Types.ObjectId(tableId),
    startTime: { $lte: endTimeISOS },
    endTime: { $gte: endTimeISOS },
    status: { $in: ["Paid", "Created"] },
  });

  console.log("result1:: ", result1);
  console.log("result2:: ", result2);

  if (result1 || result2) return false;
  else return true;
}

module.exports = {
  orderExpiredUpdate,
  orderPaymentSuccessfully,
  checkIfAvailable,
};
