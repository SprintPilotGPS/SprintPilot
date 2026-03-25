const Requisito = require("../models/Requisito");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// conseguir todo los requisitos
const getAllRequisitos = async (req, res) => {
  try {
    // ⭐ Ordenar por el campo 'orden' para que las flechas funcionen
    const requisitos = await Requisito.find().sort({ orden: 1 });

    res.render("requisitos_index", {
      title: "Sprint Pilot",
      requisitos: requisitos,
    });
  } catch (error) {
    console.error("Error al obtener requisitos:", error);
    res.status(500).render("requisitos_index", {
      title: "Sprint Pilot",
      requisitos: [],
      error: "Error al cargar los datos",
    });
  }
};
// Mover requisito hacia arriba
const moverArriba = async (req, res) => {
  try {
    const actual = await Requisito.findById(req.params.id);
    if (!actual) return res.status(404).send("No encontrado");

    const superior = await Requisito.findOne({ orden: actual.orden - 1 });
    if (!superior) return res.sendStatus(200); // ya está arriba

    // Intercambiar orden
    await Requisito.updateOne({ _id: actual._id }, { orden: actual.orden - 1 });
    await Requisito.updateOne({ _id: superior._id }, { orden: superior.orden + 1 });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al mover arriba");
  }
};

// Mover requisito hacia abajo
const moverAbajo = async (req, res) => {
  try {
    const actual = await Requisito.findById(req.params.id);
    if (!actual) return res.status(404).send("No encontrado");

    const inferior = await Requisito.findOne({ orden: actual.orden + 1 });
    if (!inferior) return res.sendStatus(200); // ya está abajo

    // Intercambiar orden
    await Requisito.updateOne({ _id: actual._id }, { orden: actual.orden + 1 });
    await Requisito.updateOne({ _id: inferior._id }, { orden: inferior.orden - 1 });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al mover abajo");
  }
};


const createRequisito = async (req, res) => {
  try {
    const nombre = typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";

    if (nombre) {
      const duplicatedRequisito = await Requisito.findOne({
        nombre: { $regex: new RegExp(`^${escapeRegExp(nombre)}$`, "i") },
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
  moverArriba,
  moverAbajo,
};
