const Sprint = require("../models/Sprint");

const { printLog, info } = require("./utils");

const getSprintPage = async (req, res) => {
  try {
    const { project_id } = req.params;
    printLog(req, true, false);

    // Buscamos el sprint activo y el historial del proyecto.
    const sprintActual = await Sprint.findOne({ project_id, activo: true });
    const sprintsPasados = await Sprint.find({ project_id, activo: false }).sort({
      identificador: -1,
    });

    res.render("currentSprint", {
      title: "Sprints del Proyecto",
      project_id,
      sprint: sprintActual,
      sprintsPasados,
    });
  } catch (error) {
    console.error("❌ Error grave en getSprintPage:", error.message);
    res.status(500).render("currentSprint", {
      title: "Error",
      project_id: req.params.project_id,
      sprint: null,
      sprintsPasados: [],
      error: "Error al cargar los datos.",
    });
  }
};

const getSprint = async (req, res) => {
  try {
    const { project_id } = req.params; 
    const { sprint_id } =req.params;
    printLog(req, true, false); 

    //Buscamos sprints que correspondan al proyecto
    const sprint = await Sprint.findOne({ project_id: project_id, identificador: sprint_id});
    console.log(sprint);
    res.render("sprintsPasados", {
      title: "Sprints del Proyecto",
      project_id: project_id, 
      sprint: sprint,
    });

  } catch (error) {
    console.error("❌ Error grave en getSprintPage:", error.message);
    res.status(500).render("sprintsPasados", {
      title: "Error",
      sprint: null,
      error: "Error al cargar los datos."
    });
  }
};

const createSprint = async (req, res) => {
  try {
    printLog(req, true, false);
    const { project_id } = req.params;
    const { identificador, sprintGoal } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: "El project_id es obligatorio.",
      });
    }

    const lastSprint = await Sprint.findOne({ project_id }).sort({ identificador: -1 });
    const parsedId = Number(identificador);
    const finalIdentificador =
      Number.isInteger(parsedId) && parsedId > 0
        ? parsedId
        : lastSprint
          ? lastSprint.identificador + 1
          : 1;

    const existe = await Sprint.findOne({ project_id, identificador: finalIdentificador });
    if (existe) {
      info(`Conflicto: El ID ${finalIdentificador} ya existe para el proyecto ${project_id}.`);
      return res.status(409).json({
        success: false,
        error: "Ya existe un sprint con ese número identificador en este proyecto.",
      });
    }

    await Sprint.updateMany({ project_id, activo: true }, { activo: false });

    const nuevoSprint = new Sprint({
      identificador: finalIdentificador,
      sprintGoal: typeof sprintGoal === "string" ? sprintGoal.trim() : "",
      num_requisitos: 0,
      activo: true,
      project_id,
    });

    await nuevoSprint.save();
    info(`✅ Sprint #${finalIdentificador} creado como actual para el proyecto ${project_id}`);

    res.status(201).json({
      success: true,
      data: nuevoSprint,
    });
  } catch (error) {
    console.error("❌ Error al crear sprint:", error.message);
    res.status(400).json({
      success: false,
      error: "Error al guardar el sprint. Revise los datos.",
    });
  }
};

const setCurrentSprint = async (req, res) => {
  try {
    printLog(req, true, false);
    const { project_id, sprint_id } = req.params;

    const sprint = await Sprint.findOne({ _id: sprint_id, project_id });
    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: "Sprint no encontrado para este proyecto.",
      });
    }

    await Sprint.updateMany({ project_id, activo: true }, { activo: false });
    sprint.activo = true;
    await sprint.save();

    return res.status(200).json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    console.error("❌ Error al establecer sprint actual:", error.message);
    return res.status(400).json({
      success: false,
      error: "No se pudo establecer el sprint actual.",
    });
  }
};

module.exports = {
  getSprintPage,
  getSprint,
  createSprint,
  setCurrentSprint,
};
