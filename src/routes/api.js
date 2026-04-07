const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// API routes for requisitos
router.post("/requisitos", requisitoController.createRequisito);
router.get("/requisitos/:id", requisitoController.getRequisitoById);
router.put("/requisitos/:id", requisitoController.updateRequisito);
router.delete("/requisitos/:id", requisitoController.deleteRequisito);

router.post("/projects", projectController.createProject);

module.exports = router;
