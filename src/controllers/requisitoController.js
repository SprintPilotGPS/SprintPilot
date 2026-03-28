const Requisito = require("../models/Requisito");
const Proyectos = require("../models/Proyecto");
const Utils = require("./utils");

// conseguir todo los requisitos
const getAllRequisitos = async (req, res) => {
  try {
    Utils.printLog(req, true, false);

    let project_id = req.params.id;

    const requisitos = await Requisito.find({ project_id: project_id }).sort({ orden: 1 });
    res.render("requisitos", {
      title: "Sprint Pilot",
      requisitos: requisitos,
      project_id: project_id,
    });
  } catch (error) {
    console.error("Error al obtener requisitos:", error);
    res.status(500).render("requisitos", {
      title: "Sprint Pilot",
      requisitos: [],
      project_id: project_id,
      error: "Error al cargar los datos",
    });
  }
};

const createRequisito = async (req, res) => {
  try {
    Utils.printLog(req, true, false);

    let project_id = req.params.project_id;
    const nombre = typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";

    if (nombre) {
      const duplicatedRequisito = await Requisito.findOne({
        nombre: { $regex: new RegExp(`^${Utils.escapeRegExp(nombre)}$`, "i") },
        project_id: project_id,
      });

      if (duplicatedRequisito) {
        return res.status(409).json({
          success: false,
          error: "Ya existe un requisito con el mismo nombre",
        });
      }
    }

    const project = await Proyectos.findOne({ identificador: project_id });
    if (!project) {
      return res.status(404).json({
        success: false,
      });
    }

    req.body.nombre = nombre;
    let r = req.body;
    const requisito = new Requisito({
      identificador: project.num_requisitos + 1,
      nombre: r.nombre,
      prioridad: r.prioridad,
      estado: r.estado,
      responsable: r.responsable,
      descripcion: r.descripcion,
      project_id: r.project_id,
    });
    await requisito.save();
    await project.updateOne({ num_requisitos: project.num_requisitos + 1 });

    res.status(201).json({
      success: true,
      data: requisito,
    });
  } catch (error) {
    console.error("Error al crear requisito:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Obtener requisito por ID
const getRequisitoById = async (req, res) => {
  try {
    Utils.printLog(req, true, false);

    const requisito = await Requisito.findById(req.params.id);
    if (!requisito) {
      return res.status(404).json({
        success: false,
        error: "Requisito no encontrado",
      });
    }
    res.json({
      success: true,
      data: requisito,
    });
  } catch (error) {
    console.error("Error al obtener requisito:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
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
    if (!requisito) {
      return res.status(404).json({
        success: false,
        error: "Requisito no encontrado",
      });
    }
    res.json({
      success: true,
      data: requisito,
    });
  } catch (error) {
    console.error("Error al actualizar requisito:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Eliminar requisito
const deleteRequisito = async (req, res) => {
  try {
    Utils.printLog(req, true, false);

    const requisito = await Requisito.findByIdAndDelete(req.params.id);
    if (!requisito) {
      return res.status(404).json({
        success: false,
        error: "Requisito no encontrado",
      });
    }
    res.json({
      success: true,
      message: "Requisito eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar requisito:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Expotamos al modelo los metodos para que se pueda acceder
module.exports = {
  getAllRequisitos,
  createRequisito,
  getRequisitoById,
  updateRequisito,
  deleteRequisito,
};
