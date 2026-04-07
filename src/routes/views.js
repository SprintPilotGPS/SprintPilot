const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");
const sprintController = require("../controllers/sprintController");

// View routes
router.get("/", projectController.getAllProyectos);
router.get("/{:id}/backlog", requisitoController.getAllRequisitos);

router.get("/crear-sprint", (req, res) => {
    res.render("formularioCrearsprint");
});

router.get("/:project_id/sprints", sprintController.getSprintPage);
module.exports = router;
