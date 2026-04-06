const Requisito = require("../models/Requisito");
const Proyectos = require("../models/Proyecto");
const Utils = require("./utils");

// Obtener todos los requisitos ordenados para la vista
const getAllRequisitos = async (req, res) => {
  try {
    Utils.printLog(req, true, false);
    
    // Usamos project_id para que coincida con las rutas de tu compañero
    const project_id = req.params.project_id || req.params.id;

    // Ordenamos por el campo 'orden' para que la vista respete los movimientos de las flechas
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
      project_id: req.params.project_id,
      error: "Error al cargar los datos",
    });
  }
};

// Mover requisito hacia arriba (Intercambio de orden con el superior inmediato)
const moverArriba = async (req, res) => {
  try {
    const actual = await Requisito.findById(req.params.id);
    if (!actual) return res.status(404).send("No encontrado");

    // Buscamos el requisito que tenga el orden inmediatamente inferior dentro del mismo proyecto
    const superior = await Requisito.findOne({ 
      project_id: actual.project_id, 
      orden: { $lt: actual.orden } 
    }).sort({ orden: -1 });

    if (!superior) return res.sendStatus(200); // Ya es el primero, no hace nada

    // Intercambiamos los valores de orden entre los dos
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

// Mover requisito hacia abajo (Intercambio de orden con el inferior inmediato)
const moverAbajo = async (req, res) => {
  try {
    const actual = await Requisito.findById(req.params.id);
    if (!actual) return res.status(404).send("No encontrado");

    // Buscamos el requisito que tenga el orden inmediatamente superior dentro del mismo proyecto
    const inferior = await Requisito.findOne({ 
      project_id: actual.project_id, 
      orden: { $gt: actual.orden } 
    }).sort({ orden: 1 });

    if (!inferior) return res.sendStatus(200); // Ya es el último

    // Intercambiamos
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
    Utils.printLog(req, true, false);
    const project_id = req.params.project_id;
    const nombre = typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";

    // Validación de duplicados insensible a mayúsculas
    const duplicated = await Requisito.findOne({
      nombre: { $regex: new RegExp(`^${nombre}$`, "i") },
      project_id: project_id
    });

    if (duplicated) {
      return res.status(409).json({ success: false, error: "Ya existe un requisito con ese nombre" });
    }

    const project = await Proyectos.findOne({ identificador: project_id });
    if (!project) return res.status(404).json({ success: false, error: "Proyecto no encontrado" });

    // Calculamos el orden automático: buscar el último y sumar 1
    const ultimoRequisito = await Requisito.findOne({ project_id }).sort({ orden: -1 });
    const nuevoOrden = ultimoRequisito ? ultimoRequisito.orden + 1 : 1;

    const requisito = new Requisito({
      identificador: project.num_requisitos + 1,
      nombre: nombre,
      prioridad: req.body.prioridad,
      estado: req.body.estado,
      responsable: req.body.responsable,
      descripcion: req.body.descripcion,
      project_id: project_id,
      orden: nuevoOrden // Campo fundamental para los botones de flechas
    });

    await requisito.save();
    
    // Actualizar el contador de requisitos del proyecto
    await Proyectos.updateOne(
        { identificador: project_id }, 
        { $inc: { num_requisitos: 1 } }
    );

    res.status(201).json({ success: true, data: requisito });
  } catch (error) {
    console.error("Error al crear requisito:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Obtener requisito por ID
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

// Actualizar requisito
const updateRequisito = async (req, res) => {
  try {
    Utils.printLog(req, true, false);
    const requisito = await Requisito.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!requisito) return res.status(404).json({ success: false, error: "No encontrado" });
    res.json({ success: true, data: requisito });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Eliminar requisito
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