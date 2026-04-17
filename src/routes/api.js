const express = require("express");
const router = express.Router();
const huController = require("../controllers/huController");
const projectController = require("../controllers/projectController");
const sprintController = require("../controllers/sprintController");

// --- RUTAS DE PROYECTOS ---
router.post("/projects", projectController.createProject);

// --- RUTAS DE HUS (Jerárquicas) ---

// Crear una HU dentro de un proyecto
router.post("/:project_id/hus", huController.createHU);

// Obtener, actualizar o eliminar una HU específica
// Nota: El :id es el ID de MongoDB (_id)
router.get("/:project_id/hus/:id", huController.viewHU);
router.put("/:project_id/hus/:id", huController.updateHU);
router.delete("/:project_id/hus/:id", huController.deleteHU);

// --- RUTAS DE MOVIMIENTO (Para las flechas) ---
// Estas son las que llaman tus botones de la interfaz
router.post("/:project_id/hus/:id/mover-arriba", huController.moverArriba);
router.post("/:project_id/hus/:id/mover-abajo", huController.moverAbajo);
router.post('/:project_id/hus/update/:id', huController.updateHU);

// --- RUTAS DE SPRINTS ---
router.get("/:project_id/sprints/:id", sprintController.getSprint);
router.post("/:project_id/crearSprint", sprintController.crearSprint);

module.exports = router;