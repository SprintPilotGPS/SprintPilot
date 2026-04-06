const mongoose = require("mongoose");

const requisitoSchema = new mongoose.Schema(
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
    prioridad: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    estado: {
      type: String,
      enum: ["in-progress", "pending", "completed"],
      default: "pending",
    },
    responsable: {
      type: String,
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
    }
  },
  { timestamps: true }
);

// Evitamos que se cree el modelo varias veces si se recarga el servidor
module.exports = mongoose.models.Requisito || mongoose.model("Requisito", requisitoSchema);
