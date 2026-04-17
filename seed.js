require("dotenv").config();
const mongoose = require("mongoose");
const HU = require("./src/models/HU");
const Proyecto = require("./src/models/Proyecto");

const husData = [
  {
    identificador: 0,
    titulo: "Completar sistema de autenticación de usuarios",
    descripcion: "Implementar autenticación JWT y funcionalidad de inicio de sesión y registro",
    project_id: "PR",
    orden: 1,
  },
  {
    identificador: 1,
    titulo: "Optimizar el rendimiento de consultas de base de datos",
    descripcion: "Agregar índices y optimizar consultas lentas",
    project_id: "PR",
    orden: 2,
  },
  {
    identificador: 0,
    titulo: "Reestructuración de páginas frontend",
    descripcion: "Reestructurar página frontend usando Bootstrap",
    project_id: "LO",
    orden: 1,
  },
  {
    identificador: 1,
    titulo: "Redacción de documentación de API",
    descripcion: "Escribir documentación completa de interfaz API",
    project_id: "LO",
    orden: 2,
  },
  {
    identificador: 2,
    titulo: "Cobertura de pruebas unitarias",
    descripcion: "Mejorar cobertura de pruebas de código a 80% o superior",
    project_id: "LO",
    orden: 3,
  },
];

const proyectosData = [
  {
    identificador: "PR",
    nombre: "Prueba de proyecto",
    descripcion:
      "Esta es una descripción corta del proyecto y se vera con mas detalle cuando entres",
    num_HUs: 2,
  },
  {
    identificador: "LO",
    nombre: "Longaniza",
    descripcion:
      "Esta es una descripción corta del proyecto y se vera con mas detalle cuando entres",
    num_HUs: 3,
  },
  {
    identificador: "JU",
    nombre: "Jugantes",
    descripcion: "",
    num_HUs: 0,
  },
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/sprintpilot";

    await mongoose.connect(mongoURI);
    console.log("✅ Conectado a MongoDB exitosamente");

    // Limpiar datos existentes
    await HU.deleteMany({});
    await Proyecto.deleteMany({});
    console.log("🗑️  Datos existentes eliminados");

    // Insertar datos de ejemplo
    await HU.insertMany(husData);
    await Proyecto.insertMany(proyectosData);
    console.log("✅ Datos de ejemplo insertados exitosamente");

    console.log("\n📊 HUs insertadas:");
    const hus = await HU.find();
    hus.forEach((req) => {
      console.log(`  - ${req.identificador}: ${req.titulo}`);
    });
    console.log("\n📊 Proyectos insertados:");
    const proyectos = await Proyecto.find();
    proyectos.forEach((proy) => {
      console.log(`  - ${proy.identificador}: ${proy.nombre}`);
    });

    await mongoose.connection.close();
    console.log("\n👋 Conexión a base de datos cerrada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al alimentar la base de datos:", error);
    process.exit(1);
  }
};

seedDatabase();
