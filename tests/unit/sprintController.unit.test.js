const sprintController = require("../../src/controllers/sprintController");
const Sprint = require("../../src/models/Sprint");
const Proyectos = require("../../src/models/Proyecto");
const HU = require("../../src/models/HU");

jest.mock("../../src/models/Sprint");
jest.mock("../../src/models/Proyecto");
jest.mock("../../src/models/HU");
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

describe("sprintController unit tests - Exhaustive", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("crearSprint", () => {
    test("debería devolver 409 si el ID del sprint está duplicado", async () => {
      const req = {
        params: { project_id: "p1" },
        body: { fechaFin: new Date(Date.now() + 100000) }
      };
      const res = mockRes();

      Sprint.findOne
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue({ id: 5 }) }) // lastSprint (nuevo será 6)
        .mockResolvedValueOnce({ id: 6 }); // duplicateId (ya existe)

      await sprintController.crearSprint(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Ya existe un Sprint con este ID numérico." }));
    });

    test("debería devolver 500 si falla el save() del nuevo sprint", async () => {
      const req = {
        params: { project_id: "p1" },
        body: { fechaFin: new Date(Date.now() + 100000) }
      };
      const res = mockRes();

      Sprint.findOne
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue(null) })
        .mockResolvedValueOnce(null);
      
      Sprint.prototype.save = jest.fn().mockRejectedValue(new Error("DB Save Error"));

      await sprintController.crearSprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Error interno del servidor al crear el sprint." }));
    });

    test("debería devolver 500 si falla el updateOne() del sprint anterior", async () => {
      const req = {
        params: { project_id: "p1" },
        body: { fechaFin: new Date(Date.now() + 100000) }
      };
      const res = mockRes();

      Sprint.findOne
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue({ _id: "old" }) })
        .mockResolvedValueOnce(null);
      
      Sprint.prototype.save = jest.fn().mockResolvedValue({});
      // El updateOne falla DESPUÉS del save
      Sprint.updateOne = jest.fn().mockRejectedValue(new Error("DB Update Error"));

      await sprintController.crearSprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("editarSprintGoal", () => {
    test("debería devolver 400 si el sprint no existe", async () => {
      const req = {
        params: { project_id: "p1", id: "1" },
        body: { sprintGoal: "Nueva Meta" }
      };
      const res = mockRes();

      Sprint.findOne.mockResolvedValue(null);

      await sprintController.editarSprintGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "El sprint no existe." }));
    });

    test("debería devolver 500 si falla el updateOne()", async () => {
      const req = {
        params: { project_id: "p1", id: "1" },
        body: { sprintGoal: "Nueva Meta" }
      };
      const res = mockRes();

      const mockSprint = { updateOne: jest.fn().mockRejectedValue(new Error("DB Error")) };
      Sprint.findOne.mockResolvedValue(mockSprint);

      await sprintController.editarSprintGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("debería validar que el goal no supere 250 caracteres", async () => {
      const req = {
        params: { project_id: "p1", id: "1" },
        body: { sprintGoal: "a".repeat(251) }
      };
      const res = mockRes();

      await sprintController.editarSprintGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "El Sprint Goal no puede superar los 250 caracteres." }));
    });
  });
});
