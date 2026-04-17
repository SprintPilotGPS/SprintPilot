const request = require("supertest");
const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("./db-handler");
const app = require("../../src/app");
const Proyecto = require("../../src/models/Proyecto");

describe("HU API Tests", () => {
  let testProjectId = "PR-TEST";

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    // Re-creamos el proyecto antes de cada test para que siempre exista
    await Proyecto.create({
      identificador: testProjectId,
      nombre: "Proyecto de Test",
      num_hus: 0
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("POST /api/:project_id/hus", () => {
    
    // 1. TEST POSITIVO: Creación normal
    test("should create a new hu", async () => {
      const hu = {
        titulo: "Test HU",
        descripcion: "Prueba de integración",
      };

      const res = await request(app)
        .post(`/api/${testProjectId}/hus`)
        .send(hu)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.titulo).toBe("Test HU");
    });

    // 2. TEST NEGATIVO: Datos inválidos (Falta título)
    test("should return 400 for invalid data (missing titulo)", async () => {
      await request(app)
        .post(`/api/${testProjectId}/hus`)
        .send({  })
        .expect(400); // Para que esto pase a verde, recuerda el cambio en el 'catch' del controlador
    });

    // 3. TEST NEGATIVO: Proyecto inexistente
    test("should return 404 if project does not exist", async () => {
      await request(app)
        .post("/api/NO-EXISTE/hus")
        .send({ titulo: "Invalido" })
        .expect(404);
    });

    // 4. TEST DE CONFLICTO: Título duplicado (Recuperado)
    test("should return 409 when titulo already exists in same project", async () => {
      const hu = {
        titulo: "Duplicado",
      };

      // Insertamos el primero
      await request(app)
        .post(`/api/${testProjectId}/hus`)
        .send(hu)
        .expect(201);

      // Intentamos insertar el mismo título
      const res = await request(app)
        .post(`/api/${testProjectId}/hus`)
        .send(hu)
        .expect(409); 

      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/hus/:id", () => {
    test("should return 404 for non-existent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/hus/${fakeId}`)
        .expect(404);
    });
  });
});