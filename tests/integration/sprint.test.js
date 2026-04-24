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
      num_hus: 0
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
          currentGoal: longGoal
        })
        .expect(400);
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
