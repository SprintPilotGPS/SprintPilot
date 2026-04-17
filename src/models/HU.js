const mongoose = require("mongoose");

const huSchema = new mongoose.Schema(
  {
    identificador: {
      type: Number,
      required: true,
      immutable: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
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
    },
    sprint_id: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

// Evitamos que se cree el modelo varias veces si se recarga el servidor
module.exports = mongoose.models.HU || mongoose.model("HU", huSchema);
