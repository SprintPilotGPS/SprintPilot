const Sprint = require("../models/Sprint");
const HU = require("../models/HU");
const Proyectos = require("../models/Proyecto");
const Utils = require("./utils");

const getSprintActual = async (req, res) => {
  try {
    const { project_id } = req.params;
    const sprint = await Sprint.findOne({ project_id, estado: "activo" }).sort({ numero: -1 });

    let hus = [];
    if (sprint) {
      hus = await HU.find({ project_id, sprint_id: sprint.numero }).sort({ orden: 1 });
    }

    // Obtener HUs que no están en ningún sprint (para el modal de creación)
    const availableHUs = await HU.find({ project_id, sprint_id: null }).sort({ orden: 1 });

    res.render("SprintActual", {
      title: "Sprint Pilot - Sprint Actual",
      project_id,
      sprint,
      hus,
      availableHUs
    });
  } catch (error) {
    console.error("Error al obtener sprint actual:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const getSprintPasados = async (req, res) => {
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

const getSprint = async (req, res) => {
  try {
    const { project_id, id } = req.params;
    const sprint = await Sprint.findOne({ project_id, numero: id });
    if (!sprint) return res.status(404).json({ success: false, error: "Sprint no encontrado" });

    const hus = await HU.find({ project_id, sprint_id: sprint.numero }).sort({ orden: 1 });
    res.json({ success: true, data: { sprint, hus } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const crearSprint = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { hus_ids } = req.body;

    // Cerrar sprint activo anterior si existe
    await Sprint.updateMany({ project_id, estado: "activo" }, { estado: "completado", fecha_fin: new Date() });

    // Obtener el siguiente número de sprint
    const lastSprint = await Sprint.findOne({ project_id }).sort({ numero: -1 });
    const nextNumber = lastSprint ? lastSprint.numero + 1 : 1;

    const newSprint = new Sprint({
      numero: nextNumber,
      project_id,
      estado: "activo",
    });

    await newSprint.save();

    // Asignar HUs al nuevo sprint
    if (hus_ids && Array.isArray(hus_ids)) {
      await HU.updateMany(
        { project_id, identificador: { $in: hus_ids } },
        { sprint_id: nextNumber }
      );
    }

    res.status(201).json({ success: true, data: newSprint });
  } catch (error) {
    console.error("Error al crear sprint:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getSprintActual,
  getSprintPasados,
  getSprint,
  crearSprint,
};
