const sprintController = require("../../src/controllers/sprintController");
const Sprint = require("../../src/models/Sprint");

// Mock del modelo Sprint
jest.mock("../../src/models/Sprint");

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

describe("sprintController unit tests - createSprint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debería crear un nuevo sprint con éxito (201)", async () => {
    const req = {
      params: { project_id: "proy-123" },
      body: { identificador: 1, sprintGoal: "Mi meta" }
    };
    const res = mockRes();

    // Corregimos el mock para que soporte .sort()
    // La primera llamada es para lastSprint, la segunda para ver si existe
    Sprint.findOne
      .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(null) }) // lastSprint
      .mockResolvedValueOnce(null); // existe

    Sprint.updateMany.mockResolvedValue({ nModified: 1 });
    
    // Mock del save para la instancia creada con 'new Sprint'
    Sprint.prototype.save = jest.fn().mockResolvedValue({ 
      identificador: 1, 
      project_id: "proy-123" 
    });

    await sprintController.createSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test("debería devolver 409 si el identificador ya existe", async () => {
    const req = {
      params: { project_id: "proy-123" },
      body: { identificador: 5 }
    };
    const res = mockRes();

    // lastSprint no encuentra nada, pero 'existe' encuentra un sprint (conflicto)
    Sprint.findOne
      .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(null) })
      .mockResolvedValueOnce({ identificador: 5 });

    await sprintController.createSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Ya existe un sprint con ese número identificador en este proyecto." })
    );
  });

  test("debería asignar el siguiente ID automáticamente si no se envía uno", async () => {
    const req = {
      params: { project_id: "proy-123" },
      body: { sprintGoal: "Auto-id" }
    };
    const res = mockRes();

    // lastSprint devuelve ID 10, 'existe' devuelve null para el 11
    Sprint.findOne
      .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue({ identificador: 10 }) })
      .mockResolvedValueOnce(null);

    Sprint.prototype.save = jest.fn().mockResolvedValue({});

    await sprintController.createSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("debería devolver 400 si falta el project_id", async () => {
    const req = { params: {}, body: { identificador: 1 } };
    const res = mockRes();

    await sprintController.createSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "El project_id es obligatorio." })
    );
  });

  test("debería capturar errores y devolver 400", async () => {
    const req = { params: { project_id: "error-id" }, body: {} };
    const res = mockRes();

    // Forzamos un error que caiga en el catch
    Sprint.findOne.mockImplementation(() => { throw new Error("DB Error"); });

    await sprintController.createSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});