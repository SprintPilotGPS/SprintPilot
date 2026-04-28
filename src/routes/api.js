const express = require("express");
const router = express.Router();
const huController = require("../controllers/huController");
const projectController = require("../controllers/projectController");
const sprintController = require("../controllers/sprintController");

// --- API de PROYECTOS ---
router.post("/projects", projectController.createProject);

// --- API de HU ---
router.post("/:project_id/hus", huController.createHU);
router.get("/:project_id/hus/:id", huController.viewHU);
router.put("/:project_id/hus/:id", huController.updateHU);
router.delete("/:project_id/hus/:id", huController.deleteHU);
router.post("/:project_id/hus/:id/mover-arriba", huController.moverArriba);
router.post("/:project_id/hus/:id/mover-abajo", huController.moverAbajo);
router.post("/:project_id/hus/update/:id", huController.updateHU);

// --- API de Sprints ---
router.post("/:project_id/crearSprint", sprintController.crearSprint);
router.get("/:project_id/sprints/:id", sprintController.getSprint);
router.post("/:project_id/sprint/:id/hu", sprintController.actualizarHUSprint);
router.post("/:project_id/sprint/:id/goal", sprintController.editarSprintGoal);

// --- API de Criterios de Aceptación ---
const criteriosController = require("../controllers/criteriosController");
router.post("/:project_id/HU/:id/crearCA", criteriosController.crearCriterio);
router.post("/criterios", criteriosController.crearCriterio);

module.exports = router;
