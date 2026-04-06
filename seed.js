require("dotenv").config();
const mongoose = require("mongoose");
const Requisito = require("./src/models/Requisito");
const Proyecto = require("./src/models/Proyecto");
const Sprint = require("./src/models/Sprint"); // <--- Importamos tu modelo de Sprint

const requisitosData = [
  {
    identificador: 0,
    nombre: "Completar sistema de autenticación de usuarios",
    prioridad: "high",
    orden: 0,
    estado: "in-progress",
    responsable: "Juan",
    descripcion: "Implementar autenticación JWT y funcionalidad de inicio de sesión y registro",
    project_id: "PR",
  },
  {
    identificador: 1,
    nombre: "Optimizar el rendimiento de consultas de base de datos",
    prioridad: "medium",
    orden: 1,
    estado: "pending",
    responsable: "María",
    descripcion: "Agregar índices y optimizar consultas lentas",
    project_id: "PR",
  },
  {
    identificador: 2,
    nombre: "Reestructuración de páginas frontend",
    prioridad: "high",
    orden: 0,
    estado: "completed",
    responsable: "Carlos",
    descripcion: "Reestructurar página frontend usando Bootstrap",
    project_id: "LO",
  },
  {
    identificador: 3,
    nombre: "Redacción de documentación de API",
    prioridad: "medium",
    orden: 1,
    estado: "in-progress",
    responsable: "Ana",
    descripcion: "Escribir documentación completa de interfaz API",
    project_id: "LO",
  },
  {
    identificador: 4,
    nombre: "Cobertura de pruebas unitarias",
    prioridad: "low",
    orden: 2,
    estado: "pending",
    responsable: "Pedro",
    descripcion: "Mejorar cobertura de pruebas de código a 80% o superior",
    project_id: "LO",
  },
];

const proyectosData = [
  {
    identificador: "PR",
    nombre: "Prueba de proyecto",
    descripcion: "Esta es una descripción corta del proyecto y se vera con mas detalle cuando entres",
    num_requisitos: 2,
  },
  {
    identificador: "LO",
    nombre: "Longaniza",
    descripcion: "Esta es una descripción corta del proyecto y se vera con mas detalle cuando entres",
    num_requisitos: 3,
  },
  {
    identificador: "JU",
    nombre: "Jugantes",
    descripcion: "",
    num_requisitos: 0,
  },
];

// --- NUEVOS DATOS DE SPRINTS ---
const sprintsData = [
  {
    identificador: 1,
    sprintGoal: "Configurar el entorno base y la conexión a MongoDB",
    num_requisitos: 3,
    activo: false, 
    project_id: "PR"
  },
  {
    identificador: 2,
    sprintGoal: "Diseñar el Dashboard de proyectos y modelos iniciales",
    num_requisitos: 5,
    activo: false,
    project_id: "PR"
  },
  {
    identificador: 3,
    sprintGoal: "Implementar la gestión de requisitos y validaciones",
    num_requisitos: 4,
    activo: true,
    project_id: "PR"
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/sprintpilot";

    await mongoose.connect(mongoURI);
    console.log("✅ Conectado a MongoDB exitosamente");

    // Limpiar datos existentes
    await Requisito.deleteMany({});
    await Proyecto.deleteMany({});
    await Sprint.deleteMany({}); // <--- Limpiamos sprints
    console.log("🗑️  Datos existentes eliminados");

    // Insertar datos de ejemplo
    await Requisito.insertMany(requisitosData);
    await Proyecto.insertMany(proyectosData);
    await Sprint.insertMany(sprintsData); // <--- Insertamos sprints
    console.log("✅ Datos de ejemplo insertados exitosamente");

    console.log("\n📊 Sprints insertados:");
    const sprints = await Sprint.find();
    sprints.forEach((s) => {
      console.log(`  - Sprint #${s.identificador} [${s.activo ? 'ACTIVO' : 'PASADO'}]: ${s.sprintGoal}`);
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