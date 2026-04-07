const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// View routes
router.get("/", projectController.getAllProyectos);
router.get("/{:id}/backlog", requisitoController.getAllRequisitos);
router.get('/{:project_id}/requisitos/:id', requisitoController.getRequisitoById); 
router.get('/{:project_id}/requisitos/edit/:id', requisitoController.getRequisitoEditForm);

module.exports = router;
