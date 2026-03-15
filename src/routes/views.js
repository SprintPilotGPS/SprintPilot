const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");

// View routes
router.get("/", requisitoController.getAllRequisitos);

module.exports = router;
