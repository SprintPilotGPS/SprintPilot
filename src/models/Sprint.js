const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema({
  numero: { 
    type: Number, 
    required: true 
  },
  project_id: { 
    type: String, 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['activo', 'completado'], 
    default: 'activo' 
  },
  fecha_inicio: {
    type: Date,
    default: Date.now
  },
  fecha_fin: {
    type: Date
  }
}, { timestamps: true });

// Índice compuesto para asegurar que el número de sprint sea único por proyecto
sprintSchema.index({ numero: 1, project_id: 1 }, { unique: true });

module.exports = mongoose.models.Sprint || mongoose.model("Sprint", sprintSchema);
