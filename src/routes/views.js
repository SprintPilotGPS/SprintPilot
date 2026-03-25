const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const proyectController =require("../controllers/proyectController");

// View routes
router.get("/", requisitoController.getAllRequisitos);
router.get("/proyectos", proyectController.getAllProyectos);

module.exports = router;
