const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// --- RUTAS DE PROYECTOS ---
router.post("/projects", projectController.createProject);

// --- RUTAS DE REQUISITOS (Jerárquicas) ---

// Crear un requisito dentro de un proyecto
router.post("/:project_id/requisitos", requisitoController.createRequisito);

// Obtener, actualizar o eliminar un requisito específico
// Nota: El :id es el ID de MongoDB (_id)
router.get("/requisitos/:id", requisitoController.getRequisitoById);
router.put("/requisitos/:id", requisitoController.updateRequisito);
router.delete("/requisitos/:id", requisitoController.deleteRequisito);

// --- RUTAS DE MOVIMIENTO (Para las flechas) ---
// Estas son las que llaman tus botones de la interfaz
router.post("/requisitos/:id/mover-arriba", requisitoController.moverArriba);
router.post("/requisitos/:id/mover-abajo", requisitoController.moverAbajo);
router.post('/requisitos/update/:id', requisitoController.updateRequisito);

module.exports = router;