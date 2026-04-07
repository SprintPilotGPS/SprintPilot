const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// View routes
router.get("/", projectController.getAllProyectos);
router.get("/{:project_id}/backlog", requisitoController.getAllRequisitos);
router.get('/{:project_id}/requisitos/:id/view', requisitoController.viewRequisito); 
router.get('/{:project_id}/requisitos/:id/edit', requisitoController.editRequisito);

module.exports = router;
