const HU = require("../models/HU");

// Crear criterio
exports.crearCriterio = async (req, res) => {
  try {
    const { project_id, id } = req.params; // ID de proyecto e historia de usuario
    const { texto } = req.body;

    if (!texto || texto.trim() === "") {
      return res.status(400).json({ mensaje: "El criterio está vacío" });
    }

    const project_id_normalized = project_id ? project_id.toUpperCase() : "";
    const hu = await HU.findOne({ project_id: project_id_normalized, identificador: id });
    
    if (!hu) {
      console.error(`HU no encontrada: proyecto=${project_id_normalized}, id=${id}`);
      return res.status(404).json({ mensaje: "Historia de usuario no encontrada" });
    }

    hu.criterios_aceptacion.push(texto);
    await hu.save();

    console.log(`Criterio guardado en HU ${id} del proyecto ${project_id_normalized}`);

    res.status(201).json({
      mensaje: "Criterio guardado correctamente",
      hu: hu,
      project_id: project_id_normalized,
    });
    /*
    res.status(200).render("detalleHU", {
      title: "Sprint Pilot - Ver HU",
      hu: hu,
      project_id: project_id,
    });*/
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar el criterio",
      error: error.message,
    });
  }
};
