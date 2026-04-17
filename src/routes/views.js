const express = require("express");
const router = express.Router();
const huController = require("../controllers/huController");
const projectController = require("../controllers/projectController");

// View routes
router.get("/", projectController.getAllProyectos);
router.get("/{:project_id}/backlog", huController.getAllHUs);
router.get('/{:project_id}/hus/:id/view', huController.viewHU); 
router.get('/{:project_id}/hus/:id/edit', huController.editHU);

module.exports = router;
