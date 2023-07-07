const { model, default: mongoose } = require("mongoose");
const { Schema, Types } = mongoose;

const phoneCallSchema = new Schema({
  caller: { type: Types.ObjectId, required: true, ref: "User" },
  receiver: { type: Types.ObjectId, required: true, ref: "User" },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  date: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  duration: { type: Number, required: true },
});

module.exports = model("PhoneCall", phoneCallSchema);
