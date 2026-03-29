const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    identificador: {
      type: Number,
      required: true,
      unique: true,
      immutable: true,
    },
    sprintGoal: {
      type: String,
      trim: true,
    },
    num_requisitos: {
      type: Number
    },
    activo:{
      type: Boolean
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);
