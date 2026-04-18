const Sprint = require("../models/Sprint");
const Proyectos = require("../models/Proyecto"); // Importamos Proyectos para validar que existe
const HU = require("../models/HU");
const Utils = require("./utils");


const getSprint = async (req, res) => {
  try {
    const { project_id, id } = req.params;

    // Busca el sprint por ID numérico e ID de proyecto
    const sprint = await Sprint.findOne({ project_id: project_id, id: Number(id) });
    if (!sprint) {
      return res.status(404).json({ success: false, error: "Sprint no encontrado" });
    }

    // Busca las historias de usuario asociadas a este sprint
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
    const hus = (sprint)? await HU.find({ project_id, sprint_id: sprint.id }).sort({ orden: 1 }) : [];

    res.render("sprintActual", {
          title: "SprintPilot - Proyectos",
          project_id: project_id,
          sprint: sprint,
          hus: hus
        });
    Utils.info("Enviado info de sprint actual correctamente: " + JSON.stringify(sprint.toJSON()));
  } catch (error) {
    
  }
}

const getAllSprintPasados = async (req, res) => {
  try {
    const { project_id } = req.params;
    const sprints = await Sprint.find({ project_id, estado: "completado" }).sort({ numero: -1 });

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
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const sprints = await Sprint.find(filter)
      .sort({ startDate: -1 })
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
    const project_id = req.params.project_id;
    const sprint = await Sprint.findOne({ project_id }).sort({ numero: -1 });
    const id = (sprint) ? sprint.id + 1 : 1;
    Utils.info("Id del nuevo sprint: " + id);

    let fechaIni = req.body.fechaIni;
    let fechaFin = req.body.fechaFin;
    const sprintGoal = req.body.sprintGoal;
    const HU = req.body.HU || [];

    if (!id || !project_id || !fechaIni || !fechaFin) {
      return res.status(400).json({
        success: false,
        error:
          "El ID del sprint, el ID del proyecto, la fecha de inicio y la fecha de fin son obligatorios.",
      });
    }

    const proyectoExiste = await Proyectos.findOne({identificador: project_id});
    if (!proyectoExiste) {
      return res.status(404).json({
        success: false,
        error: `No se ha encontrado ningún proyecto con el identificador '${project_id}'. No se puede crear el Sprint.`,
      });
    }

    fechaIni = new Date(fechaIni);
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

    // TODO incluir minima suración de sprint
    let timeDiff = Math.abs(fechaFin.getTime() - fechaIni.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; 
    Utils.info("Duración: " + diffDays + " dias");

    // TODO cuando este el sprint goal descomentar
    /* if (sprintGoal.length > 250) {
      return res.status(400).json({
        success: false,
        error: "El Sprint Goal no puede superar los 250 caracteres.",
      });
    } */

    const duplicateId = await Sprint.findOne({ id: Number(id) });
    if (duplicateId) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un Sprint con este ID numérico.",
      });
    }

    const nuevoSprint = new Sprint({
      id: Number(id),
      project_id: proyectoExiste.identificador, // Usamos el ID validado de la BD
      fechaIni: fechaIni,
      fechaFin: fechaFin,
      HU: Array.isArray(HU) ? HU : [],
      sprintGoal: sprintGoal,
    });

    await nuevoSprint.save();

    res.status(201).json({
      success: true,
      data: nuevoSprint,
    });
  } catch (error) {
    console.error("Error al crear sprint:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al crear el sprint. Vuelva a intentarlo.",
    });
  }
};

module.exports = {
  getSprint,
  getSprintActual,
  getAllSprintPasados,
  getAllSprints,
  crearSprint,
};
