const request = require("supertest");
const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("./db-handler");
const app = require("../../src/app");

describe("Requisito API Tests", () => {
  beforeAll(async () => {
    // 1. connect to the in-memory database
    await connect();
  });

  afterEach(async () => {
    // 2. clear the database after each test
    await clearDatabase();
  });

  afterAll(async () => {
    // 3. close the database after all tests
    await closeDatabase();
  });

  describe("POST /api/requisitos", () => {
    test("should create a new requisito", async () => {
      const requisito = {
        identificador: 5,
        nombre: "Test Requisito",
        prioridad: "low",
        estado: "pending",
        responsable: "Pedro",
        descripcion: "Mejorar cobertura de pruebas de código a 80% o superior",
      };

      const res = await request(app).post("/api/requisitos").send(requisito).expect(201);

      expect(res.body.data).toHaveProperty("identificador");
      expect(res.body.data.nombre).toBe("Test Requisito");
    });

    test("should return 400 for invalid data", async () => {
      const res = await request(app).post("/api/requisitos").send({}).expect(400);
    });

    test("should return 409 when nombre already exists", async () => {
      const requisito = {
        nombre: "Duplicado",
        prioridad: "medium",
        estado: "pending",
        responsable: "Ana",
        descripcion: "Primera version",
      };

      await request(app).post("/api/requisitos").send(requisito).expect(201);

      const res = await request(app)
        .post("/api/requisitos")
        .send({ ...requisito, nombre: "  duplicado  " })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/mismo nombre/i);
    });
  });

  describe("GET /api/requisitos/:id", () => {
    test("should return 404 for non-existent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/requisitos/${fakeId}`).expect(404);
    });
  });
});
