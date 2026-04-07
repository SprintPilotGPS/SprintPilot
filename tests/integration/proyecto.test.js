const request = require("supertest");
const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("./db-handler");
const app = require("../../src/app");

describe("Proyecto API Tests", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("POST /api/projects", () => {
    test("should create a new proyecto", async () => {
      const proyecto = {
        id: "test",
        nombre: "Test Proyecto",
        descripcion: "test integral",
      };

      const res = await request(app).post("/api/projects").send(proyecto).expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe("Test Proyecto");
    });

    test("should return 400 for invalid data", async () => {
      // Enviamos vacío para disparar la validación que pusimos de (!id || !nombre)
      await request(app).post("/api/projects").send({}).expect(400);
    });

    test("should return 409 when nombre already exists", async () => {
      const p1 = { id: "proyecto1", nombre: "Repetido" };
      const p2 = { id: "proyecto2", nombre: "Repetido" };

      await request(app).post("/api/projects").send(p1).expect(201);
      const res = await request(app).post("/api/projects").send(p2).expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/nombre/i);
    });

    test("should return 409 when id already exists", async () => {
      const p1 = { id: "idunico", nombre: "Proyecto 1" };
      const p2 = { id: "idunico", nombre: "Proyecto 2" };

      await request(app).post("/api/projects").send(p1).expect(201);
      const res = await request(app).post("/api/projects").send(p2).expect(409);

      expect(res.body.success).toBe(false);
      // Usamos regex para aceptar "ID", "identificador" o "existe"
      expect(res.body.error).toMatch(/identificador|ID|existe/i);
    });
  });

  describe("GET /projects", () => {
    test("should return the list of projects", async () => {
      // Asegúrate de que esta ruta esté definida en tus views
      await request(app).get("/").expect(200);
    });
  });
});