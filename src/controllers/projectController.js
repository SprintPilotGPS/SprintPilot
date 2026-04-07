const Proyectos = require("../models/Proyecto");

// Para mostrar la lista de proyectos en la vista
const getAllProyectos = async (req, res) => {
  try {
    const projects = await Proyectos.find();
    res.render("projects", {
      title: "Lista de Proyectos",
      projects: projects,
    });
    console.log("Enviado la lista de proyectos correctamente");
  } catch (error) {
    console.error("Error: no se pudo cargar los proyectos");
    res.status(500).render("projects", {
      title: "Error Lista de Proyectos",
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
        error: "Ya existe un proyecto con ese identificador.",
      });
    }

    //Comprobar Nombre Duplicado (Insensible a mayúsculas)
    const duplicateName = await Proyectos.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre}$`, "i") } 
    });
    if (duplicateName) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un proyecto con ese nombre.",
      });
    }

    // Guardado en Base de Datos (Normalizamos el ID a Mayúsculas)
    const p = new Proyectos({ 
      identificador: id.toUpperCase(), 
      nombre: nombre, 
      descripcion: descripcion 
    });
    
    await p.save();
    
    res.status(201).json({
      success: true,
      data: p,
    });

  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({
      success: false,
      error: "Error interno al crear el proyecto. Vuelva a intentarlo.",
    });
  }
};
module.exports = {
  getAllProyectos,
  createProject,
};
