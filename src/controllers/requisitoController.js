const Requisito = require("../models/Requisito");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// conseguir todo los requisitos
const getAllRequisitos = async (req, res) => {
  try {
    let project_id = req.params.id;
    
    console.log("Project ID: " + project_id);
    console.log("Method: " + req.method);
    console.log("Info of petition: " + JSON.stringify(req.body));

    const requisitos = await Requisito.find({project_id: project_id}).sort({ orden: 1 });
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
    let project_id = req.params.project_id;
    const nombre = typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";

    console.log("Project ID: " + project_id);
    console.log("Method: " + req.method);
    console.log("Info of petition: " + JSON.stringify(req.body));

    if (nombre) {
      const duplicatedRequisito = await Requisito.findOne({
        nombre: { $regex: new RegExp(`^${escapeRegExp(nombre)}$`, "i") },
        project_id: project_id
      });

      if (duplicatedRequisito) {
        return res.status(409).json({
          success: false,
          error: "Ya existe un requisito con el mismo nombre",
        });
      }
    }

    req.body.nombre = nombre;
    const requisito = new Requisito(req.body);
    await requisito.save();
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
