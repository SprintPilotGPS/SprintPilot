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

  test("debería crear un nuevo sprint y actualizar el anterior con currentGoal", async () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 5);
    const req = {
      params: { project_id: "proy-123" },
      body: { 
        fechaFin: fecha, 
        sprintGoal: "Nueva Meta",
        currentGoal: "Meta del viejo"
      },
    };
    const res = mockRes();

    const mockLastSprint = { _id: "old-id", id: 1, sprintGoal: "" };

    // Mock para findOne: primero lastSprint, luego duplicateId
    Sprint.findOne
      .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(mockLastSprint) }) // lastSprint
      .mockResolvedValueOnce(null); // duplicateId

    Sprint.prototype.save = jest.fn().mockResolvedValue({});
    Sprint.updateOne = jest.fn().mockResolvedValue({});

    await sprintController.crearSprint(req, res);

    expect(Sprint.prototype.save).toHaveBeenCalled();
    // Verificar que se actualizó el sprint anterior con la meta enviada
    expect(Sprint.updateOne).toHaveBeenCalledWith(
      { _id: "old-id" },
      { $set: { estado: "completado", sprintGoal: "Meta del viejo" } }
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("debería devolver 400 si la fecha de fin es anterior a la de inicio", async () => {
    const fechaPasada = new Date();
    fechaPasada.setDate(fechaPasada.getDate() - 5);
    const req = {
      params: { project_id: "proy-123" },
      body: { fechaFin: fechaPasada },
    };
    const res = mockRes();

    await sprintController.crearSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      error: "La fecha de fin debe ser posterior a la fecha de inicio." 
    }));
    // No debería haber guardado nada
    expect(Sprint.prototype.save).not.toHaveBeenCalled();
  });

  test("debería crear un sprint con meta vacía si no se proporciona", async () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 5);
    const req = {
      params: { project_id: "proy-123" },
      body: { fechaFin: fecha },
    };
    const res = mockRes();

    Sprint.findOne
      .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(null) })
      .mockResolvedValueOnce(null);

    Sprint.prototype.save = jest.fn().mockResolvedValue({});

    await sprintController.crearSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    // Verificamos que se instanció con goal vacío (esto es implícito en el save, 
    // pero podemos verificar que no lanzó error de validación)
  });
});

describe("sprintController unit tests - editarSprintGoal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("debería devolver 400 si el Sprint Goal está vacío", async () => {
    const req = {
      params: { project_id: "p1", id: "1" },
      body: { sprintGoal: "   " } // vacío tras trim
    };
    const res = mockRes();

    await sprintController.editarSprintGoal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
      error: "El ID del sprint y el Sprint Goal son obligatorios." 
    }));
  });

  test("debería actualizar el goal con éxito", async () => {
    const req = {
      params: { project_id: "p1", id: "1" },
      body: { sprintGoal: "Nueva Meta" }
    };
    const res = mockRes();

    const mockSprint = { updateOne: jest.fn().mockResolvedValue({}) };
    Sprint.findOne.mockResolvedValue(mockSprint);

    await sprintController.editarSprintGoal(req, res);

    expect(mockSprint.updateOne).toHaveBeenCalledWith({ sprintGoal: "Nueva Meta" });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
