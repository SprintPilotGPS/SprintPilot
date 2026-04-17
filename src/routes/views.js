const express = require("express");
const router = express.Router();
const huController = require("../controllers/huController");
const projectController = require("../controllers/projectController");
const sprintController = require("../controllers/sprintController");

// View routes
router.get("/", projectController.getAllProyectos);
router.get("/:project_id/backlog", huController.getAllHUs);
router.get("/:project_id/hus/:id/view", huController.viewHU);
router.get("/:project_id/hus/:id/edit", huController.editHU);

// Sprint routes
router.get("/:project_id/sprints-actual", sprintController.getSprintActual);
router.get("/:project_id/sprint-pasado", sprintController.getSprintPasados);

module.exports = router;
