const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");

// View routes
router.get("/", requisitoController.getAllRequisitos);

router.get("/nuevo-proyecto", (req, res) => {
    res.render("createProyecto");
});

router.get("/crear-sprint", (req, res) => {
    res.render("partials/formularioCrearsprint");
});

module.exports = router;
