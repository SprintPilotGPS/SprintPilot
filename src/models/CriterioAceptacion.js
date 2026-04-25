const mongoose = require("mongoose");

const criterioSchema = new mongoose.Schema({
  texto: {
    type: String,
    required: true,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CriterioAceptacion", criterioSchema);
