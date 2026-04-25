const Criterio = require("../models/CriterioAceptacion");

// Crear criterio
exports.crearCriterio = async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto || texto.trim() === "") {
      return res.status(400).json({ mensaje: "El criterio está vacío" });
    }

    const nuevoCriterio = new Criterio({ texto });
    await nuevoCriterio.save();

    res.status(201).json({
      mensaje: "Criterio guardado correctamente",
      data: nuevoCriterio,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar el criterio",
      error: error.message,
    });
  }
};

// Obtener todos (opcional, para verlos luego)
exports.obtenerCriterios = async (req, res) => {
  try {
    const criterios = await Criterio.find().sort({ creadoEn: -1 });
    res.json(criterios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener criterios" });
  }
};
