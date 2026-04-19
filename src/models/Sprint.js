const mongoose = require("mongoose");

// Definimos la estructura basada en la foto de la pizarra
const sprintSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
    // Eliminamos unique: true global para permitir Sprint #1 en múltiples proyectos
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
  fechaIni: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  HU: [{
    type: Number // Es un array de números (los IDs de las Historias de Usuario)
  }],
  sprintGoal: {
    type: String
  }
}, {
  // Esto añade automáticamente createdAt y updatedAt (opcional pero muy recomendado)
  timestamps: true 
});

// Definimos un índice compuesto único para que el ID de sprint sea único DENTRO de un proyecto
sprintSchema.index({ project_id: 1, id: 1 }, { unique: true });

// Creamos y exportamos el modelo
const Sprint = mongoose.model("Sprint", sprintSchema);

module.exports = Sprint;