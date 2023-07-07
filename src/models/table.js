const { model, default: mongoose } = require("mongoose");
const { Schema } = mongoose;

const tableSchema = new Schema({
  number: String,
});

module.exports = model("Table", tableSchema);
