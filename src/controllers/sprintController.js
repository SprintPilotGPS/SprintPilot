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
    const hus = (sprint)? await HU.find({ project_id, identificador: { $in: sprint.HU } }).sort({ orden: 1 }) : [];
    
    // Obtenemos las HUs del proyecto que NO están en NINGÚN sprint (ni activo ni completado)
    const todosSprints = await Sprint.find({ project_id });
    const husEnSprints = todosSprints.reduce((acc, s) => acc.concat(s.HU), []);
    
    const backlog = await HU.find({ 
      project_id, 
      identificador: { $nin: husEnSprints } 
    }).sort({ orden: 1 });

    res.render("sprintActual", {
          title: "SprintPilot - Proyectos",
          project_id: project_id,
          sprint: sprint,
          hus: hus,
          backlog: backlog
        });
    if (sprint) Utils.info("Enviado info de sprint actual correctamente: " + JSON.stringify(sprint.toJSON()));
  } catch (error) {
    console.error("Error al obtener sprint actual:", error);
    res.status(500).send("Error interno del servidor");
  }
}

const getAllSprintPasados = async (req, res) => {
  try {
    const { project_id } = req.params;
    const sprints = await Sprint.find({ project_id: project_id, estado: "completado" }).sort({ id: -1 });

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
    let id = 1;
    if (lastSprint && lastSprint.id !== undefined && lastSprint.id !== null) {
      id = Number(lastSprint.id) + 1;
    }
    Utils.info("Id del nuevo sprint: " + id);

    let fechaIni = req.body.fechaIni;
    let fechaFin = req.body.fechaFin;
    const sprintGoal = req.body.sprintGoal ? req.body.sprintGoal.trim() : "";
    const HU_ids = req.body.HU || [];

    // 3. Validación de campos obligatorios básicos
    if (!id || !project_id || !fechaIni || !fechaFin) {
      Utils.info(`Faltan campos: id=${id}, project_id=${project_id}, fechaIni=${fechaIni}, fechaFin=${fechaFin}`);
      return res.status(400).json({
        success: false,
        error:
          "El ID del sprint, el ID del proyecto, la fecha de inicio y la fecha de fin son obligatorios.",
      });
    }

    // 4. Validar que el Proyecto Padre realmente existe en la Base de Datos
    const proyectoExiste = await Proyectos.findOne({
      identificador: { $regex: new RegExp(`^${project_id}$`, "i") },
    });

    if (!proyectoExiste) {
      return res.status(404).json({
        success: false,
        error: `No se ha encontrado ningún proyecto con el identificador '${project_id}'. No se puede crear el Sprint.`,
      });
    }

    const fInicio = new Date(fechaIni);
    const fFin = new Date(fechaFin);

    if (isNaN(fInicio.getTime()) || isNaN(fFin.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Las fechas introducidas no tienen un formato válido.",
      });
    }

    if (fInicio >= fFin) {
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

    // 6. Comprobar Identificador Duplicado DENTRO del mismo proyecto
    const duplicateId = await Sprint.findOne({ project_id: proyectoExiste.identificador, id: Number(id) });
    if (duplicateId) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un Sprint con este ID numérico para este proyecto.",
      });
    }

    // 7. Si todo está perfecto, creamos y guardamos el Sprint
    // Pero antes, cerramos cualquier sprint activo previo para este proyecto
    await Sprint.updateMany({ project_id: proyectoExiste.identificador, estado: "activo" }, { estado: "completado" });

    const nuevoSprint = new Sprint({
      id: Number(id),
      project_id: proyectoExiste.identificador,
      fechaIni: fInicio,
      fechaFin: fFin,
      HU: Array.isArray(HU_ids) ? HU_ids : [],
      sprintGoal: sprintGoal,
      estado: "activo" // Aseguramos que el nuevo sea el activo
    });

    await nuevoSprint.save();

    // Actualizamos las HUs para que sepan a qué sprint pertenecen
    if (HU_ids.length > 0) {
      await HU.updateMany(
        { project_id: proyectoExiste.identificador, identificador: { $in: HU_ids } },
        { sprint_id: Number(id) }
      );
    }

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

const addHUsToSprint = async (req, res) => {
  try {
    const { project_id, id } = req.params;
    const { HU: HU_ids } = req.body;

    if (!HU_ids || !Array.isArray(HU_ids)) {
      return res.status(400).json({ success: false, error: "Se requiere un array de IDs de HU." });
    }

    // Actualizar el Sprint (añadir IDs al array)
    await Sprint.updateOne(
      { project_id, id: Number(id) },
      { $addToSet: { HU: { $each: HU_ids } } }
    );

    // Actualizar las HUs (ponerles el sprint_id)
    await HU.updateMany(
      { project_id, identificador: { $in: HU_ids } },
      { sprint_id: Number(id) }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error al añadir HUs al sprint:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

module.exports = {
  getSprint,
  getSprintActual,
  getAllSprintPasados,
  getAllSprints,
  crearSprint,
  addHUsToSprint,
};
