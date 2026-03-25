const Proyectos = require("../models/Proyecto");
const Requisito = require("../models/Requisito");

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

module.exports = {
  getAllProyectos,
};
