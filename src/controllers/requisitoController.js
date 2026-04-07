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

const getRequisitoEditForm = async (req, res) => {
    try {
        const requisito = await Requisito.findById(req.params.id);
        if (!requisito) return res.status(404).send("No encontrado");
        
        // Renderiza la vista 'editarRequisito' (que crearemos en el paso 2)
        res.render('editarRequisito', { requisito });
    } catch (error) {
        res.status(500).send("Error al cargar el formulario");
    }
};

// Crear un nuevo requisito
const createRequisito = async (req, res) => {
  try {
    const project_id = req.params.project_id;
    const { nombre, prioridad, estado, responsable, descripcion } = req.body;

    // 1. VALIDACIÓN PARA TEST (400): El nombre es obligatorio
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "ValidationError: El nombre del requisito es obligatorio." 
      });
    }

    // BUSQUEDA DEL PROYECTO
    const project = await Proyectos.findOne({ identificador: project_id });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: `Error de Integridad: El proyecto '${project_id}' no existe en la base de datos.` 
      });
    }

    // 2. VALIDACIÓN PARA TEST (409): No permitir nombres duplicados en el mismo proyecto
    const existeNombre = await Requisito.findOne({ 
      project_id, 
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } 
    });
    
    if (existeNombre) {
      return res.status(409).json({ 
        success: false, 
        error: "Ya existe un requisito con el mismo nombre en este proyecto." 
      });
    }

    // Lógica de ordenación
    const ultimoRequisito = await Requisito.findOne({ project_id }).sort({ orden: -1 });
    const nuevoOrden = (ultimoRequisito && ultimoRequisito.orden) ? ultimoRequisito.orden + 1 : 1;

    const requisito = new Requisito({
      identificador: (project.num_requisitos || 0) + 1,
      nombre: nombre.trim(),
      prioridad,
      estado,
      responsable,
      descripcion,
      project_id: project_id,
      orden: nuevoOrden
    });

    await requisito.save();
    
    // Incrementar el contador del proyecto
    await Proyectos.updateOne(
      { identificador: project_id }, 
      { $inc: { num_requisitos: 1 } }
    );

    res.status(201).json({ success: true, data: requisito });

  } catch (error) {
    console.error("ERROR EN DB:", error);
    
    // Si Mongoose lanza un error de validación que no capturamos antes
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};
const getRequisitoById = async (req, res) => {
  try {
    const { id } = req.params;
    const requisito = await Requisito.findById(id);

    if (!requisito) {
      // CAMBIO: En lugar de .render('404'), mandamos un status y un mensaje
      return res.status(404).send("Requisito no encontrado");
    }

    res.render('detalleRequisito', { 
      requisito, 
      project_id: requisito.project_id 
    });
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).send("Error interno del servidor");
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

    res.redirect(`/${requisito.project_id}/backlog`);
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
  getRequisitoEditForm,
  updateRequisito,
  deleteRequisito,
  moverArriba,
  moverAbajo,
};