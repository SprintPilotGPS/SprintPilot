const Proyectos = require("../models/Proyecto");
const Utils = require("./utils");

// Para mostrar la lista de proyectos en la vista
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

// Crear un nuevo proyecto (desde el formulario)
const createProject = async (req, res) => {
  try {
    // 1. Limpieza inicial y extracción (evitamos errores si algo viene undefined)
    const id = req.body.id ? req.body.id.trim() : "";
    const nombre = req.body.nombre ? req.body.nombre.trim() : "";
    const descripcion = req.body.descripcion ? req.body.descripcion.trim() : "";

    // Validación de campos obligatorios
    if (!id || !nombre) {
      return res.status(400).json({
        success: false,
        error: "El ID y el Nombre son obligatorios.",
      });
    }

    // REGEX: Solo letras y números, sin espacios ni símbolos (Corrige los "IDs extraños")
    const idRegex = /^[A-Z0-9]+$/i; 
    if (!idRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: "El ID solo puede contener letras y números (sin espacios ni símbolos).",
      });
    }

    // longitudes máximas
    if (id.length > 10) {
      return res.status(400).json({
        success: false,
        error: "El ID no puede superar los 10 caracteres.",
      });
    }
    if (nombre.length > 50) {
      return res.status(400).json({
        success: false,
        error: "El nombre no puede superar los 50 caracteres.",
      });
    }
    if (descripcion.length > 250) {
      return res.status(400).json({
        success: false,
        error: "La descripción no puede superar los 250 caracteres.",
      });
    }

    //Comprobar Identificador Duplicado (Insensible a mayúsculas)
    const duplicateId = await Proyectos.findOne({ 
      identificador: { $regex: new RegExp(`^${id}$`, "i") } 
    });
    if (duplicateId) {
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
      num_HUs: 0
    });

    await nuevoProyecto.save();

    res.status(201).json({
      success: true,
      data: nuevoProyecto
    });

  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear el proyecto. Vuelva a intentarlo."
    });
  }
};
module.exports = {
  getAllProyectos,
  createProject,
};
