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
    test("should create a new sprint and complete the previous one with currentGoal", async () => {
      // 1. Crear un sprint previo activo sin objetivo
      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        estado: "activo",
        fechaIni: new Date(Date.now() - 86400000),
        fechaFin: new Date(),
        sprintGoal: ""
      });

      // 2. Crear el segundo sprint enviando el objetivo para el primero
      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          fechaFin: new Date(Date.now() + 86400000).toISOString(),
          currentGoal: "Meta guardada al cerrar",
          sprintGoal: "Meta del nuevo sprint"
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(2);
      expect(res.body.data.sprintGoal).toBe("Meta del nuevo sprint");

      // 3. Verificar que el sprint 1 se completó y guardó la meta
      const oldSprint = await Sprint.findOne({ project_id: testProjectId, id: 1 });
      expect(oldSprint.estado).toBe("completado");
      expect(oldSprint.sprintGoal).toBe("Meta guardada al cerrar");
    });

    test("should return 400 if sprintGoal exceeds 250 characters during creation", async () => {
      const longGoal = "a".repeat(251);
      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          fechaFin: new Date(Date.now() + 86400000).toISOString(),
          sprintGoal: longGoal
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("El Sprint Goal no puede superar los 250 caracteres.");
    });

    test("should handle creation with empty goal by default", async () => {
      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          fechaFin: new Date(Date.now() + 86400000).toISOString()
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.sprintGoal).toBe("");
    });

    test("should return 400 if required fields (fechaFin) are missing", async () => {
      const res = await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          HU: []
          // missing fechaFin
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("El proyecto y la fecha de fin son obligatorios.");
    });

    test("should NOT complete the previous sprint if new sprint creation fails (atomicity)", async () => {
      // 1. Crear sprint activo
      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        estado: "activo",
        fechaIni: new Date(),
        fechaFin: new Date(Date.now() + 86400000)
      });

      // 2. Intentar crear uno nuevo con fecha inválida (debería fallar antes del save)
      await request(app)
        .post(`/api/${testProjectId}/crearSprint`)
        .send({ 
          fechaFin: "fecha-invalida"
        })
        .expect(400);

      // 3. Verificar que el sprint 1 SIGUE activo
      const oldSprint = await Sprint.findOne({ project_id: testProjectId, id: 1 });
      expect(oldSprint.estado).toBe("activo");
    });
  });

  describe("POST /api/:project_id/sprint/:id/goal", () => {
    test("should update sprint goal successfully", async () => {
      await Sprint.create({
        id: 1,
        project_id: testProjectId,
        fechaIni: new Date(),
        fechaFin: new Date(Date.now() + 86400000),
        sprintGoal: "Old Goal"
      });

      const res = await request(app)
        .post(`/api/${testProjectId}/sprint/1/goal`)
        .send({ sprintGoal: "New Goal" })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.sprintGoal).toBe("New Goal");

      const updatedSprint = await Sprint.findOne({ project_id: testProjectId, id: 1 });
      expect(updatedSprint.sprintGoal).toBe("New Goal");
    });

    test("should return 400 if sprintGoal is empty", async () => {
      await Sprint.create({ id: 1, project_id: testProjectId, fechaIni: new Date(), fechaFin: new Date() });
      
      await request(app)
        .post(`/api/${testProjectId}/sprint/1/goal`)
        .send({ sprintGoal: "" })
        .expect(400);
    });
  });
});
