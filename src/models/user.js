const { model, default: mongoose } = require("mongoose");
const { Schema, Types } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  phoneNumber: { type: String, required: true },
});

module.exports = model("User", userSchema);
