const express = require("express");
const router = express.Router();
const huController = require("../controllers/huController");
const projectController = require("../controllers/projectController");

// View routes
router.get("/", projectController.getAllProyectos);
router.get("/{:project_id}/backlog", huController.getAllHUs);
router.get('/{:project_id}/hus/:id/view', huController.viewHU); 
router.get('/{:project_id}/hus/:id/edit', huController.editHU);

// Ruta para Sprints Pasados (Mock Data)
router.get("/:project_id/sprints-pasados", (req, res) => {
  const project_id = req.params.project_id;
  
  // Datos mockeados de sprints para visualizar la interfaz
  const sprintsMock = [
    {
      nombre: "Sprint 1",
      fecha_inicio: "01/04/2026",
      fecha_fin: "14/04/2026",
      goal: "Implementar la autenticación de usuarios y la estructura base de la base de datos.",
      total_hus: 8,
      hus_completadas: 8
    },
    {
      nombre: "Sprint 2",
      fecha_inicio: "15/04/2026",
      fecha_fin: "28/04/2026",
      goal: "Desarrollo del panel principal y visualización inicial de proyectos.",
      total_hus: 12,
      hus_completadas: 10
    },
    {
      nombre: "Sprint 3",
      fecha_inicio: "01/05/2026",
      fecha_fin: "14/05/2026",
      goal: "Integración de las vistas de backlog y edición de historias de usuario.",
      total_hus: 9,
      hus_completadas: 6
    }
  ];

  res.render("sprintsPasados", {
    title: "Sprints Pasados",
    project_id: project_id,
    sprints: sprintsMock
  });
});

module.exports = router;
