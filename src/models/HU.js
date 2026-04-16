const mongoose = require("mongoose");

const huSchema = new mongoose.Schema(
  {
    identificador: {
      type: Number,
      required: true,
      immutable: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["in-progress", "pending", "completed"],
      default: "pending",
    },

    descripcion: {
      type: String,
      trim: true,
    },
    project_id: {
      type: String,
      required: true,
      immutable: true,
    },
    // CAMBIO CLAVE: Campo para gestionar la posición en la lista
    orden: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Evitamos que se cree el modelo varias veces si se recarga el servidor
module.exports = mongoose.models.HU || mongoose.model("HU", huSchema);
