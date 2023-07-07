const { model, default: mongoose } = require("mongoose");
const { Schema, Types } = mongoose;

const orderSchema = new Schema({
  tableId: { type: Types.ObjectId, required: true, ref: "Table" },
  endTime: { type: Date, required: true, default: Date.now },
  startTime: { type: Date, required: true, default: Date.now },
  status: {
    type: String,
    enum: ["Created", "Paid", "Canceled"],
    default: "Created",
  },
});

module.exports = model("Order", orderSchema);
