const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// View routes
router.get("/", projectController.getAllProyectos);
router.get("/backlog/{:id}", requisitoController.getAllRequisitos);

module.exports = router;
