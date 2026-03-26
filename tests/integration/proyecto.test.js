const request = require("supertest");
const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("./db-handler");
const app = require("../../src/app");

describe("Proyecto API Tests", () => {
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

  describe("POST /api/projects", () => {
    test("should create a new proyecto", async () => {
      const proyecto = {
        id: "test-proyecto-001",
        nombre: "Test Proyecto",
        descripcion: "test integral crear proyecto",
      };

      const res = await request(app).post("/api/projects").send(proyecto).expect(201);

      expect(res.body.data).toHaveProperty("identificador");
      expect(res.body.data.nombre).toBe("Test Proyecto");
    });

    test("should return 400 for invalid data", async () => {
      const res = await request(app).post("/api/projects").send({}).expect(400);
    });

    test("should return 409 when nombre already exists", async () => {
      const proyecto = {
        id: "test-proyecto-002",
        nombre: "Duplicado",
        descripcion: "Primera version",
      };

      const proyecto2 = {
        id: "test-proyecto-003",
        nombre: "Duplicado",
        descripcion: "Primera version",
      };

      await request(app).post("/api/projects").send(proyecto).expect(201);

      const res = await request(app).post("/api/projects").send(proyecto2).expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/mismo nombre/i);
    });

    test("should return 409 when id already exists", async () => {
      const proyecto = {
        id: "test-proyecto-002",
        nombre: "Duplicado",
        descripcion: "Primera version",
      };

      const proyecto2 = {
        id: "test-proyecto-002",
        nombre: "Duplicado2",
        descripcion: "Primera version",
      };

      await request(app).post("/api/projects").send(proyecto).expect(201);

      const res = await request(app).post("/api/projects").send(proyecto2).expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch("Ya existe un proyecto con ese identificador.");
    });
  });

  describe("GET /projects", () => {
    test("should return the list of projects", async () => {
      const res = await request(app).get("/projects").expect(200);
    });
  });
});
