const Sprint = require("../models/Sprint");
const Proyectos = require("../models/Proyecto"); // Importamos Proyectos para validar que existe
const HU = require("../models/HU");
const Utils = require("./utils");

// ---------------------------------------------------------
// FUNCIONES PENDIENTES DE IMPLEMENTAR (Stubs)
// ---------------------------------------------------------

const getSprint = async (req, res) => {
  try {
    const { project_id, id } = req.params;
    
    // Busca el sprint por ID numérico e ID de proyecto
    const sprint = await Sprint.findOne({ idProyecto: project_id, id: Number(id) });
    if (!sprint) {
      return res.status(404).json({ success: false, error: "Sprint no encontrado" });
    }

    // Busca las historias de usuario asociadas a este sprint
    const hus = await HU.find({ 
      project_id: project_id, 
      identificador: { $in: sprint.HU } 
    }).sort({ orden: 1 });
    
    res.json({ success: true, data: { sprint, hus } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

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
  res.status(501).json({ error: "No implementado todavía" });
};

// ---------------------------------------------------------
// FUNCIÓN: CREAR SPRINT
// ---------------------------------------------------------

const crearSprint = async (req, res) => {
  try {
    // 1. Extraer el idProyecto de la URL (/api/{idProyecto}/crearSprint)
    const idProyecto = req.params.idProyecto ? req.params.idProyecto.trim() : "";

    // 2. Extraer los datos del body
    const id = req.body.id; 
    const fechaIni = req.body.fechaIni ? req.body.fechaIni.trim() : "";
    const fechaFin = req.body.fechaFin ? req.body.fechaFin.trim() : "";
    const sprintGoal = req.body.sprintGoal ? req.body.sprintGoal.trim() : "";
    const HU = req.body.HU || [];

    // 3. Validación de campos obligatorios básicos
    if (id === undefined || !idProyecto || !fechaIni || !fechaFin) {
      return res.status(400).json({
        success: false,
        error: "El ID del sprint, el ID del proyecto, la fecha de inicio y la fecha de fin son obligatorios.",
      });
    }

    // 4. Validar que el Proyecto Padre realmente existe en la Base de Datos
    // Asumimos que el proyecto se busca por el campo 'identificador' que vimos en tu otro código
    const proyectoExiste = await Proyectos.findOne({ 
      identificador: { $regex: new RegExp(`^${idProyecto}$`, "i") } 
    });
    
    if (!proyectoExiste) {
      return res.status(404).json({
        success: false,
        error: `No se ha encontrado ningún proyecto con el identificador '${idProyecto}'. No se puede crear el Sprint.`,
      });
    }

    // 5. Validación de tipos y formato del Sprint
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "El ID del sprint debe ser un número válido.",
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

    // 6. Comprobar Identificador Duplicado (que no exista ya un Sprint con ese ID)
    const duplicateId = await Sprint.findOne({ id: Number(id) });
    if (duplicateId) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un Sprint con este ID numérico.",
      });
    }

    // 7. Si todo está perfecto, creamos y guardamos el Sprint
    const nuevoSprint = new Sprint({
      id: Number(id),
      idProyecto: proyectoExiste.identificador, // Usamos el ID validado de la BD
      fechaIni: fInicio,
      fechaFin: fFin,
      HU: Array.isArray(HU) ? HU : [],
      sprintGoal: sprintGoal
    });

    await nuevoSprint.save();

    res.status(201).json({
      success: true,
      data: nuevoSprint
    });

  } catch (error) {
    console.error("Error al crear sprint:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al crear el sprint. Vuelva a intentarlo."
    });
  }
};

module.exports = {
  getSprint,
  getAllSprintPasados,
  getAllSprints,
  crearSprint
};