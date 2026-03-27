const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// API routes for requisitos
router.post("/requisitos/:project_id", requisitoController.createRequisito);
router.get("/requisitos/:project_id/:id", requisitoController.getRequisitoById);
router.put("/requisitos/:project_id/:id", requisitoController.updateRequisito);
router.delete("/requisitos/:project_id/:id", requisitoController.deleteRequisito);

router.post("/projects", projectController.createProject);

module.exports = router;
