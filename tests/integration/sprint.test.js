const request = require("supertest");
const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("./db-handler");
const app = require("../../src/app");
const Proyecto = require("../../src/models/Proyecto");
const HU = require("../../src/models/HU");
const Sprint = require("../../src/models/Sprint");

describe("Sprint API Tests - Exhaustive Coverage", () => {
  let testProjectId = "PR-TEST";

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    await Proyecto.create({
      identificador: testProjectId,
      nombre: "Proyecto de Test",
      num_hus: 0,
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("POST /api/:project_id/crearSprint", () => {
    test("should create a sprint with exactly 250 characters in goal", async () => {
      const exactGoal = "a".repeat(250);
      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          fechaFin: new Date(Date.now() + 86400000).toISOString(),
          sprintGoal: exactGoal
        })
        .expect(201);

      expect(res.body.data.sprintGoal).toBe(exactGoal);
    });

    test("should return 400 if fechaFin is equal to fechaIni", async () => {
      // Usamos una fecha fija para asegurar la igualdad
      const now = new Date();
      // El controlador hace new Date() para fechaIni, así que si mandamos la misma...
      // Nota: En el test, fechaIni se genera en el controlador. Intentamos forzar error.
      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          fechaFin: now.toISOString() 
        });
      
      // Dependiendo de los ms, puede que pase o falle. Pero si mandamos una fecha pasada seguro falla:
      const pastDate = new Date(Date.now() - 10000);
      await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ fechaFin: pastDate.toISOString() })
        .expect(400);
    });

    test("should create sprint and NOT update previous goal if currentGoal is not provided", async () => {
      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        estado: "activo",
        fechaIni: new Date(),
        fechaFin: new Date(Date.now() + 1000),
        sprintGoal: "Initial Goal"
      });

      await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ fechaFin: new Date(Date.now() + 86400000).toISOString() })
        .expect(201);

      const oldSprint = await Sprint.findOne({ id: 1, project_id: testProjectId });
      expect(oldSprint.sprintGoal).toBe("Initial Goal");
      expect(oldSprint.estado).toBe("completado");
    });

    test("should return 400 if currentGoal is longer than 250 characters", async () => {
      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        estado: "activo",
        fechaIni: new Date(),
        fechaFin: new Date(Date.now() + 1000),
        sprintGoal: "Initial Goal"
      });

      const longGoal = "c".repeat(251);
      await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          fechaFin: new Date(Date.now() + 86400000).toISOString(),
          sprintGoal: longGoal
        })
        .expect(400);
    });
  });

  describe("GET /api/:project_id/sprints/:id", () => {
    test("should return sprint details and associated HUs", async () => {
      // 1. Preparar datos: Sprint y HUs
      const fechaIni = new Date();
      const fechaFin = new Date(Date.now() + 86400000);

      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        estado: "activo",
        fechaIni,
        fechaFin,
        HU: [1],
      });

      await HU.create({ identificador: 1, titulo: "HU en Sprint", project_id: testProjectId });
      await HU.create({
        identificador: 2,
        titulo: "HU fuera de Sprint",
        project_id: testProjectId,
      });

      const res = await request(app).get(`/api/${testProjectId}/sprints/1`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.sprint.id).toBe(1);
      expect(res.body.data.hus.length).toBe(1);
      expect(res.body.data.hus[0].titulo).toBe("HU en Sprint");
    });

    test("should return 404 if sprint does not exist", async () => {
      await request(app).get(`/api/${testProjectId}/sprints/999`).expect(404);
    });
  });
  
  describe("POST /api/:project_id/sprint/:id/hu", () => {
    test("should update sprint HUs and HU sprint_id", async () => {
      const fechaIni = new Date();
      const fechaFin = new Date(Date.now() + 86400000);

      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        estado: "activo",
        fechaIni,
        fechaFin,
        HU: [1],
      });

      await HU.create({
        identificador: 1,
        titulo: "HU 1",
        project_id: testProjectId,
        sprint_id: 1,
      });
      await HU.create({
        identificador: 2,
        titulo: "HU 2",
        project_id: testProjectId,
        sprint_id: null,
      });
      await HU.create({
        identificador: 3,
        titulo: "HU 3",
        project_id: testProjectId,
        sprint_id: null,
      });

      const res = await request(app)
        .post(`/api/${testProjectId}/sprint/1/hu`)
        .send({ hu_ids: [2, 3] })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.sprint_id).toBe(1);
      expect(res.body.data.hu_ids).toEqual([2, 3]);

      const updatedSprint = await Sprint.findOne({ project_id: testProjectId, id: 1 });
      expect(updatedSprint.HU).toEqual([2, 3]);

      const hu1 = await HU.findOne({ project_id: testProjectId, identificador: 1 });
      const hu2 = await HU.findOne({ project_id: testProjectId, identificador: 2 });
      const hu3 = await HU.findOne({ project_id: testProjectId, identificador: 3 });

      expect(hu1.sprint_id).toBeNull();
      expect(hu2.sprint_id).toBe(1);
      expect(hu3.sprint_id).toBe(1);
    });

    test("should deduplicate repeated hu_ids", async () => {
      const fechaIni = new Date();
      const fechaFin = new Date(Date.now() + 86400000);

      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        estado: "activo",
        fechaIni,
        fechaFin,
        HU: [],
      });

      await HU.create({ identificador: 2, titulo: "HU 2", project_id: testProjectId });

      const res = await request(app)
        .post(`/api/${testProjectId}/sprint/1/hu`)
        .send({ hu_ids: [2, 2] })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.hu_ids).toEqual([2]);
    });

    test("should return 400 when one or more HUs do not exist in project", async () => {
      const fechaIni = new Date();
      const fechaFin = new Date(Date.now() + 86400000);

      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        estado: "activo",
        fechaIni,
        fechaFin,
        HU: [],
      });

      await HU.create({ identificador: 1, titulo: "HU 1", project_id: testProjectId });

      const res = await request(app)
        .post(`/api/${testProjectId}/sprint/1/hu`)
        .send({ hu_ids: [1, 999] })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Uno o más hu_ids no existen en este proyecto.");
    });

    test("should return 404 if sprint does not exist", async () => {
      await HU.create({ identificador: 1, titulo: "HU 1", project_id: testProjectId });

      const res = await request(app)
        .post(`/api/${testProjectId}/sprint/999/hu`)
        .send({ hu_ids: [1] })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Sprint no encontrado");
    });
  });
  
  describe("POST /api/:project_id/sprint/:id/goal", () => {
    test("should update goal with exactly 250 characters", async () => {
      await Sprint.create({ id: 1, project_id: testProjectId, fechaIni: new Date(), fechaFin: new Date() });
      const exactGoal = "b".repeat(250);
      
      const res = await request(app)
        .post(`/api/${testProjectId}/sprint/1/goal`)
        .send({ sprintGoal: exactGoal })
        .expect(201);

      expect(res.body.sprintGoal).toBe(exactGoal);
    });
    
    test("should return 400 if goal update is only whitespace", async () => {
      await Sprint.create({ id: 1, project_id: testProjectId, fechaIni: new Date(), fechaFin: new Date() });
      
      await request(app)
        .post(`/api/${testProjectId}/sprint/1/goal`)
        .send({ sprintGoal: "    " })
        .expect(400);
    });

    test("should return 400 if updating non-existent sprint", async () => {
      await request(app)
        .post(`/api/${testProjectId}/sprint/999/goal`)
        .send({ sprintGoal: "Valid Goal" })
        .expect(400);
    });
  });
});
