const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// View routes
router.get("/", projectController.getAllProyectos);
router.get("/{:id}/backlog", requisitoController.getAllRequisitos);

module.exports = router;
