// necesitamos mongoose
const mongoose = require('mongoose');

// Creamos el schema de los requisitos
const requisitoSchema = new mongoose.Schema({
    identificador: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    prioridad: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    estado: {
        type: String,
        enum: ['in-progress', 'pending', 'completed'],
        default: 'pending'
    },
    responsable: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    }
},
{
    timestamps: true
});

// Le insertamos a mongoose el schema creado
const Requisito = mongoose.model('Requisito', requisitoSchema);

// Lo exportamos el schema a la coleccion en MongoDB
module.exports = Requisito;