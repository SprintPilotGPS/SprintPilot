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
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe("sprintController unit tests", () => {
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

    test("debería devolver 400 si currentGoal supera los 250 caracteres", async () => {
      const req = {
        params: { project_id: "p1" },
        body: { 
          fechaFin: new Date(Date.now() + 100000),
          sprintGoal: "a".repeat(251)
        }
      };
      const res = mockRes();

      Sprint.findOne
        .mockReturnValueOnce({ sort: jest.fn().mockResolvedValue({ _id: "old", id: 1, sprintGoal: "old goal" }) })
        .mockResolvedValueOnce(null);
      
      Sprint.prototype.save = jest.fn().mockResolvedValue({});

      await sprintController.crearSprint(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "El Sprint Goal no puede superar los 250 caracteres.",
      });
    });
  });

  describe("getSprint", () => {
    test("getSprint should return 200", async () => {
      const req = {
        params: { project_id: "PR", id: 0 }
      };
      const res = mockRes();

      const mockSprint = {
        id: 0,
        project_id: "PR",
        estado: "activo",
        fechaIni: new Date(),
        fechaFin: new Date(Date.now() + 100000),
        HU: [0],
        sprintGoal: "Prueba",
        toJSON: jest.fn().mockReturnValue({
          id: 0,
          project_id: "PR",
          estado: "activo",
          fechaIni: new Date(),
          fechaFin: new Date(Date.now() + 100000),
          HU: [0],
          sprintGoal: "Prueba",
        })
      }
      const mockHUs = [
        {
          identificador: 0,
          titulo: "Completar sistema de autenticación de usuarios",
          project_id: "PR",
          orden: 0
        },
      ]

      Sprint.findOne.mockResolvedValue(mockSprint);
      HU.find.mockReturnValue({
        sort: jest.fn().mockReturnValue(mockHUs)
      });

      await sprintController.getSprint(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          sprint: mockSprint,
          hus: mockHUs
        }
      });
    });

    test("getSprint should return 404 when sprint does not exist", async () => {
      const req = {
        params: { project_id: "PR", id: 0 }
      };
      const res = mockRes();

      Sprint.findOne.mockResolvedValue(null);

      await sprintController.getSprint(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Sprint no encontrado"
      });
    });

    test("getSprintActual should return 200", async () => {
      const req = {
        params: { project_id: "PR" }
      };
      const res = mockRes();

      const mockSprint = {
        id: 0,
        project_id: "PR",
        estado: "activo",
        fechaIni: new Date(),
        fechaFin: new Date(Date.now() + 100000),
        HU: [0],
        sprintGoal: "Prueba",
        toJSON: jest.fn().mockReturnValue({
          id: 0,
          project_id: "PR",
          estado: "activo",
          fechaIni: new Date(),
          fechaFin: new Date(Date.now() + 100000),
          HU: [0],
          sprintGoal: "Prueba",
        })
      }
      const mockHUs = [
        {
          identificador: 0,
          titulo: "Completar sistema de autenticación de usuarios",
          project_id: "PR",
          orden: 0
        },
      ]

      Sprint.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSprint)
      });
      HU.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockHUs)
      });

      await sprintController.getSprintActual(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.render).toHaveBeenCalledWith("sprintActual", {
        title: "SprintPilot - Sprint Actual",
        project_id: "PR",
        sprint: mockSprint,
        hus: mockHUs,
        allHus: mockHUs,
      })      
    });

    test("getSprintActual should return 200 when no sprint are active", async () => {
      const req = {
        params: { project_id: "PR" }
      };
      const res = mockRes();

      Sprint.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null)
      });
      HU.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null)
      });

      await sprintController.getSprintActual(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.render).toHaveBeenCalledWith("sprintActual", {
        title: "SprintPilot - Sprint Actual",
        project_id: "PR",
        sprint: null,
        hus: [],
        allHus: null,
      })      
    });

    test("getAllSprintPasados should return 200", async () => {
      const req = {
        params: { project_id: "PR" }
      };
      const res = mockRes();

      const mockSprints =[ 
        {
          id: 0,
          project_id: "PR",
          estado: "completado",
          fechaIni: new Date(),
          fechaFin: new Date(Date.now() + 100000),
          HU: [0],
          sprintGoal: "Prueba"
        },
      ]

      Sprint.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSprints)
      });

      await sprintController.getAllSprintPasados(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.render).toHaveBeenCalledWith("SprintPasados", {
        title: "SprintPilot - Sprints Pasados",
        project_id: "PR",
        sprints: mockSprints
      })      
    });

    test("getAllSprints should return 200", async () => {
      const req = {
        params: { project_id: "PR" },
        query: { status: "activo", page: 1, limit: 10 }
      };
      const res = mockRes();

      const mockSprints =[ 
        {
          id: 0,
          project_id: "PR",
          estado: "activo",
          fechaIni: new Date(),
          fechaFin: new Date(Date.now() + 100000),
          HU: [0],
          sprintGoal: "Prueba"
        },
      ]

      Sprint.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockSprints)
      });
      Sprint.countDocuments.mockResolvedValue(1)

      await sprintController.getAllSprints(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        total: 1,
        page: 1,
        pages: 1,
        data: mockSprints
      })      
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

describe("sprintController unit tests - actualizarHUSprint", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("debería actualizar HUs del sprint con éxito (200)", async () => {
    const req = {
      params: { project_id: "proy-1", id: "1" },
      body: { hu_ids: [1, 2] }
    };
    const res = mockRes();

    const mockSprint = { 
      project_id: "proy-1", 
      id: 1, 
      HU: [], 
      save: jest.fn().mockResolvedValue(true) 
    };

    Sprint.findOne.mockResolvedValue(mockSprint);
    HU.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ identificador: 1 }, { identificador: 2 }])
    });
    HU.updateMany.mockResolvedValue({ nModified: 2 });

    await sprintController.actualizarHUSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "HUs del sprint actualizadas correctamente"
    }));
    expect(mockSprint.HU).toEqual([1, 2]);
    expect(mockSprint.save).toHaveBeenCalled();
  });

  test("debería devolver 400 si hu_ids no es un array", async () => {
    const req = {
      params: { project_id: "proy-1", id: "1" },
      body: { hu_ids: "no-es-un-array" }
    };
    const res = mockRes();

    await sprintController.actualizarHUSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Debe enviar un array hu_ids con los identificadores de HUs."
    }));
  });

  test("debería devolver 400 si hu_ids contiene elementos no enteros", async () => {
    const req = {
      params: { project_id: "proy-1", id: "1" },
      body: { hu_ids: [1, "a"] }
    };
    const res = mockRes();

    await sprintController.actualizarHUSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Todos los hu_ids deben ser números enteros positivos."
    }));
  });

  test("debería devolver 404 si el sprint no existe", async () => {
    const req = {
      params: { project_id: "proy-1", id: "99" },
      body: { hu_ids: [1] }
    };
    const res = mockRes();

    Sprint.findOne.mockResolvedValue(null);

    await sprintController.actualizarHUSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Sprint no encontrado"
    }));
  });

  test("debería devolver 400 si alguna HU no existe en el proyecto", async () => {
    const req = {
      params: { project_id: "proy-1", id: "1" },
      body: { hu_ids: [1, 99] }
    };
    const res = mockRes();

    const mockSprint = { project_id: "proy-1", id: 1, HU: [] };
    Sprint.findOne.mockResolvedValue(mockSprint);
    
    // Solo se encuentra una HU (el array devuelto tiene longitud 1, pero enviamos 2 IDs)
    HU.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ identificador: 1 }])
    });

    await sprintController.actualizarHUSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Uno o más hu_ids no existen en este proyecto."
    }));
  });

  test("debería devolver 500 si ocurre un error en la base de datos", async () => {
    const req = {
      params: { project_id: "proy-1", id: "1" },
      body: { hu_ids: [1] }
    };
    const res = mockRes();

    Sprint.findOne.mockRejectedValue(new Error("Error de DB"));

    await sprintController.actualizarHUSprint(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "Error interno al procesar la actualización de la HU."
    }));
  });
});
