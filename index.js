// getting-started.js
const mongoose = require("mongoose");
const express = require("express");
const table = require("./src/models/table");
const order = require("./src/models/order");
const user = require("./src/models/user");
const phoneCall = require("./src/models/phoneCall");
const bodyParser = require("body-parser");
const RedisExpiredEvents = require("./src/redis/redis.expired-events");
const RedisRepo = require("./src/redis/redis.repo");
const {
  orderPaymentSuccessfully,
  checkIfAvailable,
} = require("./src/models/repo/order.repo");
const app = express();

const PORT = 8080;
RedisExpiredEvents();

async function dbConnect() {
  await mongoose.connect("mongodb://127.0.0.1:27017/emvn").then(() => {
    console.log("Connected");
  });
}
dbConnect().catch((err) => console.log(err));
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/add-table", async (req, res) => {
  const { number } = req.body;

  await table.create({ number });
  res.status(200).json({ status: "success" });
});

app.post("/order", async (req, res) => {
  const redisRepo = new RedisRepo();

  const { tableId, startTime, endTime } = req.body;
  const start = new Date(startTime);
  const end = new Date(endTime);
  console.log(start.getTime());
  console.log(end.getTime());
  if (start.getTime() < end.getTime()) {
    const available = checkIfAvailable({ tableId, startTime, endTime });
    if (available) {
      const newOrder = await order.create({ tableId: tableId });
      //set key value expire
      redisRepo.setReminder(newOrder._id, 1, 60);
      res.status(200).json({ status: "success", order: newOrder._id });
    } else {
      res
        .status(400)
        .json({ message: "Table has been chosen! Please pick another time" });
    }
  } else {
    res
      .status(400)
      .json({ message: "End time must be greater than start time" });
  }
});

app.put("/order/:id", async (req, res) => {
  return await orderPaymentSuccessfully(req.params.id);
});

app.post("/user", async (req, res) => {
  const { name, dateOfBirth, phoneNumber } = req.body;
  const newUser = await user.create({ name, dateOfBirth, phoneNumber });
  res.status(200).json({ newUser });
});

app.post("/phoneCall", async (req, res) => {
  const { caller, receiver, startTime, endTime } = req.body;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffTime = Math.abs(start - end);
  console.log("diff time: " + diffTime);
  const date = start.getDate();
  const month = start.getMonth() + 1;
  const year = start.getFullYear();
  const newPhoneCall = await phoneCall.create({
    caller,
    receiver,
    startTime,
    endTime,
    date,
    year,
    month,
    duration: diffTime,
  });
  res.status(200).json({ newPhoneCall });
});

app.get("/phoneCall/user/rank", async (req, res) => {
  const result = await phoneCall.aggregate([
    {
      $group: {
        _id: "$caller",
        user: { $first: "$caller" },
        durations: { $sum: "$duration" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    // { $unwind: "$userInfo" },
    {
      $group: {
        _id: "$durations",
        duration: { $first: "$durations" },
        users: { $push: "$userInfo" },
      },
    },
    { $sort: { duration: -1 } },
    // { $unwind: "$users" },
  ]);
  res.status(200).json(result);
});

app.get("/phoneCall/rank", async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  let month, year;
  const currentYear = now.getFullYear();
  if (currentMonth === 1) {
    month = 12;
    year = currentYear - 1;
  } else {
    month = currentMonth;
    year = currentYear;
  }
  console.log("month", month, year);
  const result = await phoneCall.aggregate([
    { $match: { month: month, year: year } },
    {
      $group: {
        _id: "$caller",
        durations: { $sum: "$duration" },
      },
    },
    { $sort: { durations: -1 } },
    { $limit: 3 },
  ]);

  res.status(200).json(result);
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
