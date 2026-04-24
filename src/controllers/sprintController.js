const Sprint = require("../models/Sprint");
const Proyectos = require("../models/Proyecto");
const HU = require("../models/HU");
const Utils = require("./utils");

const getSprint = async (req, res) => {
  try {
    const { project_id, id } = req.params;
    const sprint = await Sprint.findOne({ project_id: project_id, id: Number(id) });
    if (!sprint) {
      return res.status(404).json({ success: false, error: "Sprint no encontrado" });
    }
    const hus = await HU.find({
      project_id: project_id,
      identificador: { $in: sprint.HU },
    }).sort({ orden: 1 });
    res.json({ success: true, data: { sprint, hus } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSprintActual = async (req, res) => {
  Utils.printLog(req, true, false);
  try {
    const project_id = req.params.project_id;
    const sprint = await Sprint.findOne({ project_id, estado: "activo" }).sort({ id: -1 });
    const hus = sprint
      ? await HU.find({ project_id, identificador: { $in: sprint.HU } }).sort({ orden: 1 })
      : [];
    res.render("sprintActual", {
      title: "SprintPilot - Proyectos",
      project_id: project_id,
      sprint: sprint,
      hus: hus,
    });
    if (sprint)
      Utils.info("Enviado info de sprint actual correctamente: " + JSON.stringify(sprint.toJSON()));
  } catch (error) {
    console.error("Error al obtener sprint actual:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const getAllSprintPasados = async (req, res) => {
  try {
    const { project_id } = req.params;
    const sprints = await Sprint.find({ project_id: project_id, estado: "completado" }).sort({
      id: -1,
    });
    res.render("SprintPasados", {
      title: "Sprint Pilot - Sprints Pasados",
      project_id,
      sprints,
    });
  } catch (error) {
    console.error("Error al obtener sprints pasados:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const getAllSprints = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) {
      filter.estado = status;
    }
    const skip = (page - 1) * limit;
    const sprints = await Sprint.find(filter)
      .sort({ fechaIni: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Sprint.countDocuments(filter);
    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: sprints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los sprints",
      error: error.message,
    });
  }
};

const crearSprint = async (req, res) => {
  Utils.printLog(req, true, false);
  try {
    const project_id = req.params.project_id ? req.params.project_id.trim() : "";
    let { fechaFin, sprintGoal, HU: HU_ids, currentGoal } = req.body;
    
    if (!project_id || !fechaFin) {
      return res.status(400).json({
        success: false,
        error: "El proyecto y la fecha de fin son obligatorios.",
      });
    }

    const fechaIni = new Date();
    fechaFin = new Date(fechaFin);

    if (isNaN(fechaIni.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Las fechas introducidas no tienen un formato válido.",
      });
    }

    if (fechaIni >= fechaFin) {
      return res.status(400).json({
        success: false,
        error: "La fecha de fin debe ser posterior a la fecha de inicio.",
      });
    }

    sprintGoal = typeof sprintGoal === "string" ? sprintGoal.trim() : "";
    if (sprintGoal.length > 250) {
      return res.status(400).json({
        success: false,
        error: "El Sprint Goal no puede superar los 250 caracteres.",
      });
    }

    const lastSprint = await Sprint.findOne({ project_id }).sort({ id: -1 });
    const id = lastSprint ? lastSprint.id + 1 : 1;

    const duplicateId = await Sprint.findOne({ project_id: project_id, id: Number(id) });
    if (duplicateId) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un Sprint con este ID numérico.",
      });
    }

    const nuevoSprint = new Sprint({
      id: Number(id),
      project_id: project_id,
      fechaIni: fechaIni,
      fechaFin: fechaFin,
      HU: Array.isArray(HU_ids) ? HU_ids : [],
      sprintGoal: sprintGoal,
    });

    await nuevoSprint.save();
    
    if (lastSprint) {
      // Actualizamos el objetivo del sprint anterior al cerrarlo (por si el usuario escribió algo y no pulsó Enter)
      const finalGoal = (typeof currentGoal === "string" && currentGoal.trim()) ? currentGoal.trim() : lastSprint.sprintGoal;
      await Sprint.updateOne({ _id: lastSprint._id }, { 
        $set: { 
          estado: "completado",
          sprintGoal: finalGoal 
        } 
      });
    }

    res.status(201).json({
      success: true,
      data: nuevoSprint,
    });
  } catch (error) {
    console.error("Error al crear sprint:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al crear el sprint.",
    });
  }
};

const editarSprintGoal = async (req, res) => {
  Utils.printLog(req, true, false);
  try {
    const { project_id, id } = req.params;
    let { sprintGoal } = req.body;
    sprintGoal = typeof sprintGoal === 'string' ? sprintGoal.trim() : "";

    if (!id || !sprintGoal) {
      return res.status(400).json({
        success: false,
        error: "El ID del sprint y el Sprint Goal son obligatorios.",
      });
    }

    if (sprintGoal.length > 250) {
      return res.status(400).json({
        success: false,
        error: "El Sprint Goal no puede superar los 250 caracteres.",
      });
    }

    let sprint = await Sprint.findOne({ project_id: project_id, id: Number(id) });
    if (!sprint) {
      return res.status(400).json({
        success: false,
        error: "El sprint no existe.",
      });
    }

    await sprint.updateOne({ sprintGoal: sprintGoal });

    res.status(201).json({
      success: true,
      sprintGoal: sprintGoal 
    });
  } catch (error) {
    console.error("Error al editar el Sprint Goal:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al editar el Sprint Goal.",
    });
  }
};

module.exports = {
  getSprint,
  getSprintActual,
  getAllSprintPasados,
  getAllSprints,
  crearSprint,
  editarSprintGoal,
};
