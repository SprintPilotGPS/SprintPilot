const request = require("supertest");
const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("./db-handler");
const app = require("../../src/app");
const Proyecto = require("../../src/models/Proyecto");
const HU = require("../../src/models/HU");

describe("Criterios de Aceptación API Tests", () => {
  let testProjectId = "PR-TEST";
  let testHUId = 1;

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // 1. Crear el proyecto
    await Proyecto.create({
      identificador: testProjectId,
      nombre: "Proyecto de Test",
      num_hus: 1
    });

    // 2. Crear una HU para asociarle criterios
    await HU.create({
      identificador: testHUId,
      titulo: "Test HU",
      descripcion: "Prueba de integración",
      project_id: testProjectId,
      criterios_aceptacion: []
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("POST /api/:project_id/HU/:id/crearCA", () => {
    
    // 1. TEST POSITIVO: Creación correcta de un criterio
    test("should add a new acceptance criterion to an existing HU", async () => {
      const criterio = {
        texto: "Nuevo criterio de prueba"
      };

      const res = await request(app)
        .post(`/api/${testProjectId}/HU/${testHUId}/crearCA`)
        .send(criterio)
        .expect(201);

      expect(res.body.mensaje).toBe("Criterio guardado correctamente");
      expect(res.body.hu.criterios_aceptacion).toContain(criterio.texto);
      
      // Verificar en la base de datos
      const huUpdated = await HU.findOne({ project_id: testProjectId, identificador: testHUId });
      expect(huUpdated.criterios_aceptacion).toContain(criterio.texto);
    });

    // 2. TEST NEGATIVO: Texto vacío
    test("should return 400 if criterion text is empty", async () => {
      const res = await request(app)
        .post(`/api/${testProjectId}/HU/${testHUId}/crearCA`)
        .send({ texto: "" })
        .expect(400);

      expect(res.body.mensaje).toBe("El criterio está vacío");
    });

    // 3. TEST NEGATIVO: HU inexistente
    test("should return 404 if HU does not exist", async () => {
      await request(app)
        .post(`/api/${testProjectId}/HU/999/crearCA`)
        .send({ texto: "Criterio hu inexistente" })
        .expect(404);
    });

    // 4. TEST NEGATIVO: Proyecto inexistente
    test("should return 404 if project does not exist", async () => {
      // Aunque el controlador busca la HU por proyecto e ID, si el proyecto no existe
      // la búsqueda de la HU fallará y devolverá 404
      await request(app)
        .post(`/api/NO-EXISTE/HU/${testHUId}/crearCA`)
        .send({ texto: "Criterio proyecto inexistente" })
        .expect(404);
    });
  });
});
