const express = require("express");
const router = express.Router();
const huController = require("../controllers/huController");
const projectController = require("../controllers/projectController");
const sprintContoller = require("../controllers/sprintController");

// --- Vista de proyectos ---
router.get("/", projectController.getAllProyectos);

// --- Vista de HU ---
router.get("/:project_id/backlog", huController.getAllHUs);
router.get('/:project_id/hus/:id/view', huController.viewHU); 
router.get('/:project_id/hus/:id/edit', huController.editHU);

// --- Vista de sprints ---
router.get("/:project_id/sprint-actual", sprintContoller.getSprintActual);
router.get("/:project_id/sprints-pasados", sprintContoller.getAllSprintPasados);

// --- Vistas de Criterios de Aceptación ---
router.get('/:project_id/hus/:id/ca/crear', (req, res) => {
    res.render('crearCA', {
        title: "Sprint Pilot - Crear CA",
        project_id: req.params.project_id,
        hu_id: req.params.id
    });
});

module.exports = router;
