const Proyectos = require("../models/Proyecto");
const Utils = require("./utils");

// To obtain the list of all projects
const getAllProyectos = async (req, res) => {
  try {
    Utils.printLog(req, false, false);

    const projects = await Proyectos.find();

    res.render("projects", {
      title: "SprintPilot - Proyectos",
      projects: projects,
    });
    Utils.info("Enviado la lista de proyectos correctamente");
  } catch (error) {
    console.error("Error: no se pudo cargar los proyectos", error);
    res.status(500).render("projects", {
      title: "SprintPilot - Proyectos",
      projects: [],
      error: "No se pudo cargar la lista.",
    });
  }
};

// Create a new project from scratch
const createProject = async (req, res) => {
  try {
    const { id, nombre, descripcion } = req.body;

    // 1. PRIMERO validamos que existan los datos para evitar el error de .trim()
    if (!id || !nombre) {
      return res.status(400).json({
        success: false,
        error: "El ID y el nombre son obligatorios."
      });
    }

    // 2. Comprobamos si el ID ya existe (409)
    const existeId = await Proyectos.findOne({ identificador: id.trim() });
    if (existeId) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un proyecto con el mismo ID."
      });
    }

    // 3. Comprobamos si el NOMBRE ya existe (409) - ESTO ARREGLA TU TEST FALLIDO
    const existeNombre = await Proyectos.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } 
    });
    
    if (existeNombre) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un proyecto con el mismo nombre."
      });
    }

    // Si todo está bien, creamos el proyecto
    const nuevoProyecto = new Proyectos({
      identificador: id.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : "",
      num_requisitos: 0
    });

    await nuevoProyecto.save();

    res.status(201).json({
      success: true,
      data: nuevoProyecto
    });

  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(400).json({
      success: false,
      error: "Error al crear el proyecto. Vuelva a intentarlo."
    });
  }
};

module.exports = {
  getAllProyectos,
  createProject,
};
