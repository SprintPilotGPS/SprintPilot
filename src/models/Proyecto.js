const mongoose = require("mongoose");

const proyectoSchema = new mongoose.Schema({
  identificador: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true, // Lo guarda siempre en mayúsculas
    trim: true,
    minlength: 2,    // Mínimo 2 caracteres (ej: PR)
    maxlength: 10     // Máximo 10 caracteres (ej: SPRINT)
  },
  nombre: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50    // Límite de 50 para el título
  },
  descripcion: { 
    type: String, 
    trim: true,
    maxlength: 250   // Límite de 250 para la descripción
  }
}, { timestamps: true });

module.exports = mongoose.model("Proyecto", proyectoSchema);
