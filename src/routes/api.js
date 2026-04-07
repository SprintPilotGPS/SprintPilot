const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");
const projectController = require("../controllers/projectController");
const sprintController = require("../controllers/sprintController");

// API routes for requisitos

router.post("/:project_id/requisitos", requisitoController.createRequisito);
router.get("/:project_id/requisitos/:id", requisitoController.getRequisitoById);
router.put("/:project_id/requisitos/:id", requisitoController.updateRequisito);
router.delete("/:project_id/requisitos/:id", requisitoController.deleteRequisito);
router.post("/:project_id/requisitos/:id/mover-arriba", requisitoController.moverArriba);
router.post("/:project_id/requisitos/:id/mover-abajo", requisitoController.moverAbajo);
router.post("/projects", projectController.createProject);

// API routes for requisitos
router.post("/requisitos/:id/mover-arriba", requisitoController.moverArriba);
router.post("/requisitos/:id/mover-abajo", requisitoController.moverAbajo);

//API route for sprints
router.post("/:project_id/sprints", sprintController.createSprint);
router.put("/:project_id/sprints/:sprint_id/current", sprintController.setCurrentSprint);
module.exports = router;
