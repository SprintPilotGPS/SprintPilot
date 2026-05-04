const HU = require("../models/HU");
const Proyectos = require("../models/Proyecto");
const Utils = require("./utils");

/* ============= Operaciones CRUD ============= */
// Obtener todos los hus ordenados para la vista
const getAllHUs = async (req, res) => {
  Utils.printLog(req, true, false);
  const project_id = req.params.project_id;
  try {
    // Ordenamos por 'orden' para que la vista respete las flechas
    const hus = await HU.find({ project_id: project_id }).sort({ orden: 1 });
    
    res.render("hus", {
      title: "Sprint Pilot - Backlog",
      hus: hus,
      project_id: project_id,
    });
  } catch (error) {
    console.error("Error al obtener hus:", error);
    res.status(500).render("hus", {
      title: "Sprint Pilot",
      hus: [],
      project_id: project_id,
      error: "Error al cargar los datos",
    });
  }
};

// Crear un nuevo hu
const createHU = async (req, res) => {
  try {
    const project_id = req.params.project_id;
    const { titulo, descripcion } = req.body;

    // 1. VALIDACIÓN PARA TEST (400): El título es obligatorio
    if (!titulo || titulo.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ValidationError: El título del hu es obligatorio.",
      });
    }

    // BUSQUEDA DEL PROYECTO
    const project = await Proyectos.findOne({ identificador: project_id });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Error de Integridad: El proyecto '${project_id}' no existe en la base de datos.`,
      });
    }

    // 2. VALIDACIÓN PARA TEST (409): No permitir títulos duplicados en el mismo proyecto
    const existeTitulo = await HU.findOne({
      project_id,
      titulo: { $regex: new RegExp(`^${titulo.trim()}$`, "i") },
    });

    if (existeTitulo) {
      return res.status(409).json({
        success: false,
        error: "Ya existe un hu con el mismo título en este proyecto.",
      });
    }

    // Lógica de ordenación
    const ultimoHU = await HU.findOne({ project_id }).sort({ orden: -1 });
    const nuevoOrden = ultimoHU && typeof ultimoHU.orden === "number" ? ultimoHU.orden + 1 : 1;

    const hu = new HU({
      identificador: project.num_HUs || 0,
      titulo: titulo.trim(),
      descripcion,
      project_id: project_id,
      orden: nuevoOrden,
    });

    await hu.save();

    // Incrementar el contador del proyecto
    await Proyectos.updateOne({ identificador: project_id }, { $inc: { num_HUs: 1 } });

    res.status(201).json({ success: true, data: hu });
  } catch (error) {
    console.error("ERROR EN DB:", error);

    // Si Mongoose lanza un error de validación que no capturamos antes
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

const updateHU = async (req, res) => {
  try {
    Utils.printLog(req, true, false);
    const hu = await HU.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Para que respete el Enum del Modelo
    });
    if (!hu) return res.status(404).json({ success: false, error: "No encontrado" });

    res.redirect(`/${hu.project_id}/backlog`);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteHU = async (req, res) => {
  try {
    Utils.printLog(req, true, false);
    const hu = await HU.findByIdAndDelete(req.params.id);
    if (!hu) return res.status(404).json({ success: false, error: "No encontrado" });
    res.json({ success: true, message: "Eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

async function getHU(vista, req, res) {
  Utils.printLog(req, true, false);

  let project_id = req.params.project_id;
  let id = req.params.id;

  const hu = await HU.findOne({project_id: project_id, identificador: id});
  if(!hu) {
    return res.status(404).render("hus", {
      title: "Sprint Pilot - Backlog",
      hus: [],
      project_id: project_id,
      error: "HUs con identificador: " + id + " no se ha podido encontrar",
    });
  }

  res.status(200).render(vista, {
    title: "Sprint Pilot - Ver HU",
    hu: hu,
    project_id: project_id,
  });
}

const viewHU = async (req, res) => {
  try {
    getHU("detalleHU", req, res);
  } catch (error) {
    res.status(500).render("hus", {
      title: "Sprint Pilot - Backlog",
      hus: [],
      project_id: req.params.project_id,
      error: "HUs con identificador: " + req.params.id + " no se ha podido encontrar",
    });
  }
};

const editHU = async (req, res) => {
  try {
    getHU("editarHU", req, res);
  } catch (error) {
    res.status(500).render("hus", {
      title: "Sprint Pilot - Editar HU",
      hus: [],
      project_id: req.params.project_id,
      error: "HUs con identificador: " + req.params.id + " no se ha podido encontrar",
    });
  }
};

/* ============= Otras operaciones ============= */

// Mover hu hacia arriba
const moverArriba = async (req, res) => {
  try {
    Utils.printLog(req, true, false);

    let project_id = req.params.project_id;
    let id = req.params.id;

    const actual = await HU.findOne({ project_id: project_id, identificador: id });
    if (!actual) return res.status(404).send("No encontrado");

    const superior = await HU.findOne({
      project_id: actual.project_id,
      orden: { $lt: actual.orden },
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

// Mover hu hacia abajo
const moverAbajo = async (req, res) => {
  try {
    Utils.printLog(req, true, false);

    let project_id = req.params.project_id;
    let id = req.params.id;

    const actual = await HU.findOne({ project_id: project_id, identificador: id });
    if (!actual) return res.status(404).send("No encontrado");

    const inferior = await HU.findOne({
      project_id: actual.project_id,
      orden: { $gt: actual.orden },
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

/* ------ CA ------ */

const verCA = async (req, res) => {
  res.render('crearCA', {
      title: "Sprint Pilot - Crear CA",
      project_id: req.params.project_id,
      hu_id: req.params.id
  });
};

const crearCA = async (req, res) => {
  try {
    const { project_id, id } = req.params; // ID de proyecto e historia de usuario
    const { cuando, si, entonces, texto } = req.body;

    if (!texto || texto.trim() === "" || !cuando || cuando.trim() === "" || !entonces || entonces.trim() === "") {
      return res.status(400).json({ mensaje: "Se debe rellenar todos los campos obligatorios" });
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
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar el criterio",
      error: error.message,
    });
  }
};

module.exports = {
  getAllHUs,
  createHU,
  updateHU,
  deleteHU,
  viewHU,
  editHU,
  moverArriba,
  moverAbajo,
  verCA,
  crearCA
};
