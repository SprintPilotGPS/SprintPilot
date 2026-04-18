const request = require("supertest");
const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("./db-handler");
const app = require("../../src/app");
const Proyecto = require("../../src/models/Proyecto");
const HU = require("../../src/models/HU");
const Sprint = require("../../src/models/Sprint");

describe("Sprint API Tests", () => {
  let testProjectId = "PR-TEST";

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    // Crear proyecto de prueba
    await Proyecto.create({
      identificador: testProjectId,
      nombre: "Proyecto de Test",
      num_hus: 0
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("POST /api/:project_id/crearSprint", () => {
    test("should create a new sprint and assign HUs", async () => {
      // 1. Crear algunas HUs primero
      await HU.create({ identificador: 1, titulo: "HU 1", project_id: testProjectId });
      await HU.create({ identificador: 2, titulo: "HU 2", project_id: testProjectId });

      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          HU: [1, 2],
          fechaIni: new Date().toISOString(),
          fechaFin: new Date(Date.now() + 86400000).toISOString(),
          sprintGoal: "Test Sprint Goal"
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.estado).toBe("activo");
      expect(res.body.data.HU).toContain(1);
      expect(res.body.data.HU).toContain(2);
    });

    test("should handle creation without HUs", async () => {
      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          HU: [],
          fechaIni: new Date().toISOString(),
          fechaFin: new Date(Date.now() + 86400000).toISOString()
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
    });

    test("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          HU: []
          // missing fechaIni, fechaFin
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/:project_id/sprints/:id", () => {
    test("should return sprint details and associated HUs", async () => {
      // 1. Preparar datos: Sprint y HUs
      const fechaIni = new Date();
      const fechaFin = new Date(Date.now() + 86400000);
      
      await Sprint.create({ 
        id: 1, 
        idProyecto: testProjectId, 
        estado: "activo",
        fechaIni,
        fechaFin,
        HU: [1]
      });
      
      await HU.create({ identificador: 1, titulo: "HU en Sprint", project_id: testProjectId });
      await HU.create({ identificador: 2, titulo: "HU fuera de Sprint", project_id: testProjectId });

      const res = await request(app)
        .get(`/api/${testProjectId}/sprints/1`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.sprint.id).toBe(1);
      expect(res.body.data.hus.length).toBe(1);
      expect(res.body.data.hus[0].titulo).toBe("HU en Sprint");
    });

    test("should return 404 if sprint does not exist", async () => {
      await request(app)
        .get(`/api/${testProjectId}/sprints/999`)
        .expect(404);
    });
  });
});
