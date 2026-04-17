const express = require("express");
const router = express.Router();
const huController = require("../controllers/huController");
const projectController = require("../controllers/projectController");
const sprintContoller = require("../controllers/sprintController");

// --- Vista de proyectos ---
router.get("/", projectController.getAllProyectos);

// --- Vista de HU ---
router.get("/:project_id/backlog", huController.getAllHUs);
router.get('/:project_id/hus/:id/view', huController.viewHU); 
router.get('/:project_id/hus/:id/edit', huController.editHU);

// --- Vista de sprints ---
router.get("/:project_id/sprint-actual", sprintContoller.getSprint());
router.get("/:project_id/sprints-pasados", sprintContoller.getAllSprintsPasados());

module.exports = router;
