const controller = require("../../src/controllers/requisitoController");
const Requisito = require("../../src/models/Requisito");
const Proyecto = require("../../src/models/Proyecto"); // Nuevo Mock necesario

jest.mock("../../src/models/Requisito");
jest.mock("../../src/models/Proyecto");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
}

describe("requisitoController unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createRequisito should return 201 on success", async () => {
    // Simulamos req con project_id en params
    const req = { 
      params: { project_id: "PR" },
      body: { nombre: "Task A", prioridad: "high" } 
    };
    const res = mockRes();

    // Simulamos que el proyecto SÍ existe
    Proyecto.findOne.mockResolvedValue({ identificador: "PR", num_requisitos: 2 });
    
    // Simulamos que no hay requisitos previos para calcular el orden
    Requisito.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({ orden: 2 }) // El último tenía orden 2
    });

    // Mock del constructor y save
    const saveMock = jest.fn().mockResolvedValue(true);
    Requisito.mockImplementation(() => ({
      save: saveMock
    }));

    // Mock de la actualización del proyecto
    Proyecto.updateOne.mockResolvedValue({ nModified: 1 });

    await controller.createRequisito(req, res);

    expect(Proyecto.findOne).toHaveBeenCalledWith({ identificador: "PR" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("createRequisito should return 404 if project not found", async () => {
    const req = { params: { project_id: "NON-EXISTENT" }, body: { nombre: "Task A" } };
    const res = mockRes();

    // Simulamos que el proyecto NO existe
    Proyecto.findOne.mockResolvedValue(null);

    await controller.createRequisito(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        success: false,
        error: expect.stringMatching(/no existe/i)
    }));
  });

  test("getRequisitoById should return 404 when not found", async () => {
    const req = { params: { id: "507f1f77bcf86cd799439011" } };
    const res = mockRes();

    Requisito.findById.mockResolvedValue(null);

    await controller.getRequisitoById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});