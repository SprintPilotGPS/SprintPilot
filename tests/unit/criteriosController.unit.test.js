const controller = require("../../src/controllers/huController");
const HU = require("../../src/models/HU");

jest.mock("../../src/models/HU");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("criteriosController unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("crearCA should return 400 if texto is missing", async () => {
    const req = {
      params: { project_id: "PRJ", id: "1" },
      body: { texto: "" }
    };
    const res = mockRes();

    await controller.crearCA(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensaje: "El criterio está vacío" });
  });

  test("crearCA should return 404 if HU is not found", async () => {
    const req = {
      params: { project_id: "PRJ", id: "1" },
      body: { texto: "Criterio de prueba" }
    };
    const res = mockRes();

    HU.findOne.mockResolvedValue(null);

    await controller.crearCA(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ mensaje: "Historia de usuario no encontrada" });
  });

  test("crearCA should return 201 on success", async () => {
    const req = {
      params: { project_id: "PRJ", id: "1" },
      body: { texto: "Criterio de prueba" }
    };
    const res = mockRes();

    const mockHU = {
      criterios_aceptacion: [],
      save: jest.fn().mockResolvedValue(true)
    };

    HU.findOne.mockResolvedValue(mockHU);

    await controller.crearCA(req, res);

    expect(mockHU.criterios_aceptacion).toContain("Criterio de prueba");
    expect(mockHU.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Criterio guardado correctamente",
      hu: mockHU,
      project_id: "PRJ"
    });
  });

  test("crearCA should return 500 on database error", async () => {
    const req = {
      params: { project_id: "PRJ", id: "1" },
      body: { texto: "Criterio de prueba" }
    };
    const res = mockRes();

    HU.findOne.mockRejectedValue(new Error("Database failure"));

    await controller.crearCA(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: "Error al guardar el criterio",
      error: "Database failure"
    });
  });
});
