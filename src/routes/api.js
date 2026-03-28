const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");

// API routes for requisitos
router.post("/:project_id/requisitos", requisitoController.createRequisito);
router.get("/:project_id/requisitos/:id", requisitoController.getRequisitoById);
router.put("/:project_id/requisitos/:id", requisitoController.updateRequisito);
router.delete("/:project_id/requisitos/:id", requisitoController.deleteRequisito);

router.post("/projects", projectController.createProject);

module.exports = router;
