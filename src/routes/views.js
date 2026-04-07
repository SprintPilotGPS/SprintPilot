const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// View routes
router.get("/", requisitoController.getAllRequisitos);
router.get("/projects", projectController.getAllProyectos);

module.exports = router;
