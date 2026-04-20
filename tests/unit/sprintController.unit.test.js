const sprintController = require("../../src/controllers/sprintController");
const Sprint = require("../../src/models/Sprint");
const Proyectos = require("../../src/models/Proyecto");
const HU = require("../../src/models/HU");

// Mock de los modelos
jest.mock("../../src/models/Sprint");
jest.mock("../../src/models/Proyecto");
jest.mock("../../src/models/HU");

// Mock de las utilidades de log
jest.mock("../../src/controllers/utils", () => ({
  printLog: jest.fn(),
  info: jest.fn(),
}));

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  return res;
}

describe("sprintController unit tests - crearSprint", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("debería crear un nuevo sprint con éxito (201)", async () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate()+5);
    const req = {
      params: { project_id: "proy-123" },
      body: { fechaFin: fecha, sprintGoal: "Mi meta" }
    };
    const res = mockRes();

    Proyectos.findOne.mockResolvedValue({ identificador: "proy-123" });
    
    // Mock para las dos llamadas a findOne en crearSprint
    Sprint.findOne
      .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(null) }) // Para lastSprint
      .mockResolvedValueOnce(null); // Para duplicateId

    Sprint.prototype.save = jest.fn().mockResolvedValue({});

    await sprintController.crearSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("debería devolver 400 si faltan campos", async () => {
    const req = { params: { project_id: "proy-123" }, body: {} };
    const res = mockRes();

    // Mock para el primer findOne (lastSprint)
    Sprint.findOne.mockReturnValueOnce({
      sort: jest.fn().mockResolvedValue(null)
    });

    await sprintController.crearSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test("debería devolver 409 si el sprint ya existe", async () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate()+5);
    const req = {
      params: { project_id: "proy-123" },
      body: { fechaFin: fecha }
    };
    const res = mockRes();

    Proyectos.findOne.mockResolvedValue({ identificador: "proy-123" });
    
    // Mock para las dos llamadas a findOne
    Sprint.findOne
      .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue({ id: 1 }) }) // Para calcular el nuevo ID (dará 2)
      .mockResolvedValueOnce({ id: 2 }); // Para el chequeo de duplicados (dirá que el 2 ya existe)

    await sprintController.crearSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

describe("sprintController unit tests - getSprint", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("debería devolver 404 si el sprint no existe", async () => {
    const req = { params: { project_id: "proy-1", id: "99" } };
    const res = mockRes();

    Sprint.findOne.mockResolvedValue(null);

    await sprintController.getSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Sprint no encontrado" }));
  });

  test("debería devolver el sprint y sus HUs con éxito", async () => {
    const req = { params: { project_id: "proy-1", id: "1" } };
    const res = mockRes();

    const mockSprint = { project_id: "proy-1", id: 1, HU: [10, 20] };
    const mockHUs = [{ identificador: 10 }, { identificador: 20 }];

    Sprint.findOne.mockResolvedValue(mockSprint);
    HU.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockHUs) });

    await sprintController.getSprint(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { sprint: mockSprint, hus: mockHUs }
    });
  });

  test("debería capturar errores y devolver 500", async () => {
    const req = { params: { project_id: "proy-1", id: "1" } };
    const res = mockRes();

    Sprint.findOne.mockRejectedValue(new Error("Error BD"));

    await sprintController.getSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Error BD" }));
  });
});
