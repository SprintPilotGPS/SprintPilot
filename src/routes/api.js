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
router.get("/:project_id/requisitos/:id", requisitoController.viewRequisito);
router.put("/:project_id/requisitos/:id", requisitoController.updateRequisito);
router.delete("/:project_id/requisitos/:id", requisitoController.deleteRequisito);

// --- RUTAS DE MOVIMIENTO (Para las flechas) ---
// Estas son las que llaman tus botones de la interfaz
router.post("/:project_id/requisitos/:id/mover-arriba", requisitoController.moverArriba);
router.post("/:project_id/requisitos/:id/mover-abajo", requisitoController.moverAbajo);
router.post('/:project_id/requisitos/update/:id', requisitoController.updateRequisito);

module.exports = router;