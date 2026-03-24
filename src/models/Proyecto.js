const mongoose = require("mongoose");

const requisitoSchema = new mongoose.Schema(
  {
    identificador: {
      type: Number,
      required: true,
      unique: true,
      immutable: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proyecto", requisitoSchema);
