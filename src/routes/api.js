const express = require("express");
const router = express.Router();
const huController = require("../controllers/huController");
const projectController = require("../controllers/projectController");
const sprintContoller = require("../controllers/sprintController");

// --- API de PROYECTOS ---
router.post("/projects", projectController.createProject);

// --- API de HU ---
router.post("/:project_id/hus", huController.createHU);
router.get("/:project_id/hus/:id", huController.viewHU);
router.put("/:project_id/hus/:id", huController.updateHU);
router.delete("/:project_id/hus/:id", huController.deleteHU);
router.post("/:project_id/hus/:id/mover-arriba", huController.moverArriba);
router.post("/:project_id/hus/:id/mover-abajo", huController.moverAbajo);
router.post('/:project_id/hus/update/:id', huController.updateHU);

// --- API de Sprints ---
router.post("/:project_id/crearSprint", sprintContoller.crearSprint);
router.get("/:project_id/sprints/:id", sprintContoller.getSprint);

module.exports = router;