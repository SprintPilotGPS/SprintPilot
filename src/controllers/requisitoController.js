const Requisito = require("../models/Requisito");
const Proyectos = require("../models/Proyecto");
const Utils = require("./utils");

// Obtener todos los requisitos ordenados para la vista
const getAllRequisitos = async (req, res) => {
  try {
    Utils.printLog(req, true, false);
    const project_id = req.params.project_id || req.params.id;

    // Ordenamos por 'orden' para que la vista respete las flechas
    const requisitos = await Requisito.find({ project_id: project_id }).sort({ orden: 1 });
    
    res.render("requisitos", {
      title: "Sprint Pilot - Backlog",
      requisitos: requisitos,
      project_id: project_id,
    });
  } catch (error) {
    console.error("Error al obtener requisitos:", error);
    res.status(500).render("requisitos", {
      title: "Sprint Pilot",
      requisitos: [],
      project_id: req.params.project_id || req.params.id,
      error: "Error al cargar los datos",
    });
  }
};

// Mover requisito hacia arriba
const moverArriba = async (req, res) => {
  try {
    Utils.printLog(req, true, false); // Log añadido
    const actual = await Requisito.findById(req.params.id);
    if (!actual) return res.status(404).send("No encontrado");

    const superior = await Requisito.findOne({ 
      project_id: actual.project_id, 
      orden: { $lt: actual.orden } 
    }).sort({ orden: -1 });

    if (!superior) return res.sendStatus(200);

    const ordenTemporal = actual.orden;
    actual.orden = superior.orden;
    superior.orden = ordenTemporal;

    await actual.save();
    await superior.save();

    res.sendStatus(200);
  } catch (error) {
    console.error("Error al mover arriba:", error);
    res.status(500).send("Error al mover arriba");
  }
};

// Mover requisito hacia abajo
const moverAbajo = async (req, res) => {
  try {
    Utils.printLog(req, true, false); // Log añadido
    const actual = await Requisito.findById(req.params.id);
    if (!actual) return res.status(404).send("No encontrado");

    const inferior = await Requisito.findOne({ 
      project_id: actual.project_id, 
      orden: { $gt: actual.orden } 
    }).sort({ orden: 1 });

    if (!inferior) return res.sendStatus(200);

    const ordenTemporal = actual.orden;
    actual.orden = inferior.orden;
    inferior.orden = ordenTemporal;

    await actual.save();
    await inferior.save();

    res.sendStatus(200);
  } catch (error) {
    console.error("Error al mover abajo:", error);
    res.status(500).send("Error al mover abajo");
  }
};

// Crear un nuevo requisito
const createRequisito = async (req, res) => {
  try {
    const project_id = req.params.project_id; // El "PR" que viene de la URL
    
    // BUSQUEDA REAL: Si no existe el proyecto con ese identificador, ERROR.
    const project = await Proyectos.findOne({ identificador: project_id });

    if (!project) {
      // Si entra aquí, es que el SEED no se ejecutó bien o el ID en la URL está mal
      return res.status(404).json({ 
        success: false, 
        error: `Error de Integridad: El proyecto '${project_id}' no existe en la base de datos.` 
      });
    }

    // Lógica real de ordenación
    const ultimoRequisito = await Requisito.findOne({ project_id }).sort({ orden: -1 });
    const nuevoOrden = (ultimoRequisito && ultimoRequisito.orden) ? ultimoRequisito.orden + 1 : 1;

    const requisito = new Requisito({
      identificador: project.num_requisitos + 1, // Contador real del proyecto
      nombre: req.body.nombre,
      prioridad: req.body.prioridad,
      estado: req.body.estado,
      responsable: req.body.responsable,
      descripcion: req.body.descripcion,
      project_id: project_id,
      orden: nuevoOrden
    });

    await requisito.save();
    
    // ACTUALIZACIÓN REAL: Incrementamos el contador del proyecto encontrado
    await Proyectos.updateOne(
      { identificador: project_id }, 
      { $inc: { num_requisitos: 1 } }
    );

    res.status(201).json({ success: true, data: requisito });
  } catch (error) {
    console.error("ERROR EN DB:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};
const getRequisitoById = async (req, res) => {
  try {
    Utils.printLog(req, true, false);
    const requisito = await Requisito.findById(req.params.id);
    if (!requisito) return res.status(404).json({ success: false, error: "No encontrado" });
    res.json({ success: true, data: requisito });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateRequisito = async (req, res) => {
  try {
    Utils.printLog(req, true, false);
    const requisito = await Requisito.findByIdAndUpdate(req.params.id, req.body, { 
        new: true, 
        runValidators: true // Para que respete el Enum del Modelo
    });
    if (!requisito) return res.status(404).json({ success: false, error: "No encontrado" });
    res.json({ success: true, data: requisito });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteRequisito = async (req, res) => {
  try {
    Utils.printLog(req, true, false);
    const requisito = await Requisito.findByIdAndDelete(req.params.id);
    if (!requisito) return res.status(404).json({ success: false, error: "No encontrado" });
    res.json({ success: true, message: "Eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllRequisitos,
  createRequisito,
  getRequisitoById,
  updateRequisito,
  deleteRequisito,
  moverArriba,
  moverAbajo,
};