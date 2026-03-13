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

  describe("GET /api/requisitos", () => {
    test("should return empty array initially", async () => {
      const res = await request(app).get("/api/requisitos").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe("POST /api/requisitos", () => {
    test("should create a new requisito", async () => {
      const requisito = {
        nombre: "Test Requisito",
        descripcion: "This is a test",
        prioridad: "alta",
      };

      const res = await request(app).post("/api/requisitos").send(requisito).expect(201);

      expect(res.body).toHaveProperty("_id");
      expect(res.body.nombre).toBe("Test Requisito");
    });

    test("should return 400 for invalid data", async () => {
      const res = await request(app).post("/api/requisitos").send({}).expect(400);
    });
  });

  describe("GET /api/requisitos/:id", () => {
    test("should return 404 for non-existent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/requisitos/${fakeId}`).expect(404);
    });
  });
});
