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
    const hus = sprint
      ? await HU.find({ project_id, identificador: { $in: sprint.HU } }).sort({ orden: 1 })
      : [];
    const allHus = await HU.find({ project_id }).sort({ orden: 1, identificador: 1 });

    res.render("sprintActual", {
      title: "SprintPilot - Proyectos",
      project_id: project_id,
      sprint: sprint,
      hus: hus,
      allHus: allHus,
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
    const lastSprint = await Sprint.findOne({ project_id }).sort({ id: -1 });
    const id = lastSprint ? lastSprint.id + 1 : 1;
    Utils.info("Id del nuevo sprint: " + id);

    let fechaIni = new Date();
    let fechaFin = req.body.fechaFin;
    const sprintGoal = req.body.sprintGoal ? req.body.sprintGoal.trim() : "";
    const HU_ids = req.body.HU || [];

    if (!id || !project_id || !fechaIni || !fechaFin) {
      return res.status(400).json({
        success: false,
        error:
          "El ID del sprint, el ID del proyecto, la fecha de inicio y la fecha de fin son obligatorios.",
      });
    }

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

    if (sprintGoal.length > 250) {
      return res.status(400).json({
        success: false,
        error: "El Sprint Goal no puede superar los 250 caracteres.",
      });
    }

    const duplicateId = await Sprint.findOne({ project_id: project_id, id: Number(id) });
    if (duplicateId) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un Sprint con este ID numérico.",
      });
    }

    if (lastSprint) await lastSprint.updateOne({ $set: { estado: "completado" } });
    const nuevoSprint = new Sprint({
      id: Number(id),
      project_id: project_id,
      fechaIni: fechaIni,
      fechaFin: fechaFin,
      HU: Array.isArray(HU_ids) ? HU_ids : [],
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

const actualizarHUSprint = async (req, res) => {
  Utils.printLog(req, true, false);

  try {
    const { project_id, id } = req.params;
    const sprintId = Number(id);
    let { hu_ids } = req.body;

    if (!Array.isArray(hu_ids)) {
      return res.status(400).json({
        success: false,
        error: "Debe enviar un array hu_ids con los identificadores de HUs.",
      });
    }

    // Comprobamos que sean numeros los ids
    hu_ids.forEach((id) => {
      if(!Number.isInteger(id)){
        return res.status(400).json({
          success: false,
          error: "Todos los hu_ids deben ser números enteros positivos.",
          invalid_hu_ids: invalidHuIds,
        });
      }
    })

    hu_ids = [...new Set(hu_ids)];

    const sprint = await Sprint.findOne({ project_id, id: sprintId });
    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: "Sprint no encontrado",
      });
    }

    const existingHus = await HU.find({
      project_id,
      identificador: { $in: hu_ids },
    }).select("identificador");

    if (existingHus.length !== hu_ids.length) {
      return res.status(400).json({
        success: false,
        error: "Uno o más hu_ids no existen en este proyecto.",
      });
    }

    sprint.HU = hu_ids;
    await sprint.save();

    await HU.updateMany({ project_id, sprint_id: sprintId }, { $set: { sprint_id: null } });

    if (hu_ids.length > 0) {
      await HU.updateMany(
        { project_id, identificador: { $in: hu_ids } },
        { $set: { sprint_id: sprintId } }
      );
    }

    Utils.info(`Sprint ${sprintId} actualizado con ${hu_ids.length} HUs`);

    res.status(200).json({
      success: true,
      message: "HUs del sprint actualizadas correctamente",
      data: {
        sprint_id: sprintId,
        hu_ids: hu_ids,
      },
    });
  } catch (error) {
    console.error("Error en actualizarHUSprint:", error);
    res.status(500).json({
      success: false,
      error: "Error interno al procesar la actualización de la HU.",
    });
  }
};

module.exports = {
  getSprint,
  getSprintActual,
  getAllSprintPasados,
  getAllSprints,
  crearSprint,
  actualizarHUSprint,
};
