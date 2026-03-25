const Proyectos = require("../models/Proyecto");

// To obtain the list of all projects
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

// Create a new project from scratch
const createProject = async (req, res) => {
  try {
    console.log(req.body);
    const nombre = req.body.nombre.trim();
    const id = req.body.id.trim();
    const descripcion = req.body.descripcion.trim();

    const duplicateId = await Proyectos.find({ identificador: id }).exec();
    console.log("Duplicado es: ", duplicateId);
    if (duplicateId.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un proyecto con ese identificador.",
      });
    }

    if (nombre === "") {
      return res.status(409).json({
        success: false,
        error: "Se necesita dar un nombre al proyecto.",
      });
    }

    const p = new Proyectos({ identificador: id, nombre: nombre, descripcion: descripcion });
    await p.save();
    res.status(201).json({
      success: true,
      data: p,
    });
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(400).json({
      success: false,
      error: "Error al crear el proyecto. vuelva a intentarlo.",
    });
  }
};

module.exports = {
  getAllProyectos,
  createProject,
};
