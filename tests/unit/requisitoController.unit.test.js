const controller = require("../../src/controllers/requisitoController");
const Requisito = require("../../src/models/Requisito");
const Proyecto = require("../../src/models/Proyecto");

jest.mock("../../src/models/Requisito");
jest.mock("../../src/models/Proyecto");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe("requisitoController unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createRequisito should return 201 on success", async () => {
    const req = { 
      params: { project_id: "PR" },
      body: { nombre: "Task A", prioridad: "high" } 
    };
    const res = mockRes();

    // 1. Mock de Proyecto (existe)
    Proyecto.findOne.mockResolvedValue({ identificador: "PR", num_requisitos: 2 });
    
    // 2. Mock de Búsqueda de Duplicados (debe devolver null para que no falle)
    Requisito.findOne.mockResolvedValueOnce(null); 
    
    // 3. Mock de Cálculo de Orden (segunda llamada a findOne)
    Requisito.findOne.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue({ orden: 2 })
    });

    const saveMock = jest.fn().mockResolvedValue(true);
    Requisito.mockImplementation(() => ({ save: saveMock }));
    Proyecto.updateOne.mockResolvedValue({ nModified: 1 });

    await controller.createRequisito(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("getRequisitoById should return 404 when not found", async () => {
    const req = { params: { id: "507f1f77bcf86cd799439011" } };
    const res = mockRes();

    Requisito.findById.mockResolvedValue(null);

    await controller.getRequisitoById(req, res);

    // Como tu controlador ahora usa .send() en el 404
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(expect.stringMatching(/no encontrado/i));
  });
});