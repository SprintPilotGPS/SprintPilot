require('dotenv').config();
const mongoose = require('mongoose');
const Requisito = require('./src/models/Requisito');

const requisitosData = [
    {
        identificador: '#SP001',
        nombre: 'Completar sistema de autenticación de usuarios',
        prioridad: 'high',
        estado: 'in-progress',
        responsable: 'Juan',
        descripcion: 'Implementar autenticación JWT y funcionalidad de inicio de sesión y registro'
    },
    {
        identificador: '#SP002',
        nombre: 'Optimizar el rendimiento de consultas de base de datos',
        prioridad: 'medium',
        estado: 'pending',
        responsable: 'María',
        descripcion: 'Agregar índices y optimizar consultas lentas'
    },
    {
        identificador: '#SP003',
        nombre: 'Reestructuración de páginas frontend',
        prioridad: 'high',
        estado: 'completed',
        responsable: 'Carlos',
        descripcion: 'Reestructurar página frontend usando Bootstrap'
    },
    {
        identificador: '#SP004',
        nombre: 'Redacción de documentación de API',
        prioridad: 'medium',
        estado: 'in-progress',
        responsable: 'Ana',
        descripcion: 'Escribir documentación completa de interfaz API'
    },
    {
        identificador: '#SP005',
        nombre: 'Cobertura de pruebas unitarias',
        prioridad: 'low',
        estado: 'pending',
        responsable: 'Pedro',
        descripcion: 'Mejorar cobertura de pruebas de código a 80% o superior'
    }
];

const seedDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sprintpilot';
        
        await mongoose.connect(mongoURI);
        console.log('✅ Conectado a MongoDB exitosamente');

        // Limpiar datos existentes
        await Requisito.deleteMany({});
        console.log('🗑️  Datos existentes eliminados');

        // Insertar datos de ejemplo
        await Requisito.insertMany(requisitosData);
        console.log('✅ Datos de ejemplo insertados exitosamente');

        console.log('\n📊 Requisitos insertados:');
        const requisitos = await Requisito.find();
        requisitos.forEach(req => {
            console.log(`  - ${req.identificador}: ${req.nombre}`);
        });

        await mongoose.connection.close();
        console.log('\n👋 Conexión a base de datos cerrada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al alimentar la base de datos:', error);
        process.exit(1);
    }
};

seedDatabase();
