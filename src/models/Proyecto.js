const mongoose = require("mongoose");

const proyectoSchema = new mongoose.Schema(
  {
    identificador: {
      type: String,
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
    num_requisitos: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proyecto", proyectoSchema);
