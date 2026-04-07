const Sprint = require("../models/Sprint");

const { printLog, info } = require("./utils");

const getSprintPage = async (req, res) => {
  try {
    const { project_id } = req.params; 
    printLog(req, true, false); 

    //Buscamos sprints que correspondan al proyecto
    const sprintActual = await Sprint.findOne({ project_id: project_id, activo: true });
    const sprintsPasados = await Sprint.find({ project_id: project_id, activo: false });

    res.render("currentSprint", {
      title: "Sprints del Proyecto",
      project_id: project_id, 
      sprint: sprintActual,
      sprintsPasados: sprintsPasados
    });

  } catch (error) {
    console.error("❌ Error grave en getSprintPage:", error.message);
    res.status(500).render("currentSprint", {
      title: "Error",
      sprint: null,
      sprintsPasados: [],
      error: "Error al cargar los datos."
    });
  }
};

const createSprint = async (req, res) => {
  try {
    //  printLog en el POST para ver qué datos llegan del formulario
    printLog(req, true, false);
   // Sacamos el ID del proyecto de la URL
    const { project_id } = req.params; 
    
    // Sacamos los datos del cuerpo (body)
    const { identificador, sprintGoal } = req.body;
    // Validación de duplicados
    const existe = await Sprint.findOne({ identificador: identificador });
    if (existe) {
        info(`Conflicto: El ID ${identificador} ya existe.`);
        return res.status(409).json({
            success: false,
            error: "Ya existe un sprint con ese número identificador."
        });
    }

    const nuevoSprint = new Sprint({
      identificador: identificador,
      sprintGoal: sprintGoal,
      activo: false, 
      project_id: project_id
    });

    await nuevoSprint.save();
    info(`✅ Sprint #${identificador} creado para el proyecto ${project_id}`);

    res.status(201).json({
      success: true,
      data: nuevoSprint
    });

  } catch (error) {
    console.error("❌ Error al crear sprint:", error.message);
    res.status(400).json({
      success: false,
      error: "Error al guardar el sprint. Revise los datos."
    });
  }
};

module.exports = { 
    getSprintPage,
    createSprint 
};