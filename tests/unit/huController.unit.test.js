const controller = require("../../src/controllers/huController");
const HU = require("../../src/models/HU");
const Proyecto = require("../../src/models/Proyecto");

jest.mock("../../src/models/HU");
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

describe("huController unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createHU", () => {
    test("createHU should return 201 on success", async () => {
      const req = { 
        params: { project_id: "PR" },
        body: { titulo: "Task A" } 
      };
      const res = mockRes();
  
      // 1. Mock de Proyecto (existe)
      Proyecto.findOne.mockResolvedValue({ identificador: "PR", num_hus: 2 });
      
      // 2. Mock de Búsqueda de Duplicados (debe devolver null para que no falle)
      HU.findOne.mockResolvedValueOnce(null); 
      
      // 3. Mock de Cálculo de Orden (segunda llamada a findOne)
      HU.findOne.mockReturnValueOnce({
          sort: jest.fn().mockResolvedValue({ orden: 2 })
      });
  
      const saveMock = jest.fn().mockResolvedValue(true);
      HU.mockImplementation(() => ({ save: saveMock }));
      Proyecto.updateOne.mockResolvedValue({ nModified: 1 });
  
      await controller.createHU(req, res);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe("getHU", () => {
    test("getHUById should return 200 when hu exist", async () => {
      const req = { params: { project_id: "PR", id: "0" } };
      const res = mockRes();
  
      const mockHU = {
          identificador: 0,
          titulo: "Completar sistema de autenticación de usuarios",
          project_id: "PR",
          orden: 0
        };
      
      HU.findOne.mockResolvedValue(mockHU);
  
      await controller.viewHU(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.render).toHaveBeenCalledWith("detalleHU", {
        title: "Sprint Pilot - Ver HU",
        hu: mockHU,
        project_id: "PR",
      })
    });
  
    test("getHUById should return 404 when not found", async () => {
      const req = { params: { project_id: "PR", id: "0" } };
      const res = mockRes();
  
      HU.findOne.mockResolvedValue(null);
  
      await controller.viewHU(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      console.log(res.render);
      expect(res.render).toHaveBeenCalledWith("hus", {
        title: "Sprint Pilot - Backlog",
        hus: [],
        project_id: "PR",
        error: "HUs con identificador: 0 no se ha podido encontrar"
      });
    });
  
    test("getAllHUs should return 201 when correct", async () => {
      const req = {
        params: { project_id: "PR" }
      }
      const res = mockRes();
  
      const mockHUs = [
        {
          identificador: 0,
          titulo: "Completar sistema de autenticación de usuarios",
          project_id: "PR",
          orden: 0
        },
        {
          identificador: 1,
          titulo: "Optimizar el rendimiento de consultas de base de datos",
          project_id: "PR",
          orden: 1
        },
      ]
  
      HU.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockHUs)
      });
  
      await controller.getAllHUs(req, res);
  
      expect(HU.find).toHaveBeenCalledWith({ project_id: "PR" });
      expect(res.render).toHaveBeenCalledWith("hus", {
        title: "Sprint Pilot - Backlog",
        hus: mockHUs,
        project_id: "PR",
      });
    });
  
    test("getAllHU should return 500 when no conexion", async () => {
      const req = {
        params: { project_id: "PR" }
      }
      const res = mockRes();
  
      HU.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("Fallo de conexion"))
      })
  
      await controller.getAllHUs(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith("hus", expect.objectContaining({
        error: "Error al cargar los datos",
        hus: [],
        project_id: "PR"
      }))
    });
  });

  describe("moverHU", () => {
    test("moverArriba should return 200", async () => {
      const req = { params: { project_id: "PR", id: "0" } };
      const res = mockRes();
  
      mockHU = {
          identificador: 0,
          titulo: "Completar sistema de autenticación de usuarios",
          project_id: "PR",
          orden: 1,
          save: jest.fn().mockResolvedValue(true) // Simula el save
        };
      mockHUSup = {
          identificador: 1,
          titulo: "Optimizar el rendimiento de consultas de base de datos",
          project_id: "PR",
          orden: 0,
          save: jest.fn().mockResolvedValue(true) // Simula el save
        };
      
      HU.findOne.mockResolvedValueOnce(mockHU);
      HU.findOne.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(mockHUSup)
      });
  
      await controller.moverArriba(req, res);
  
      expect(mockHU.save).toHaveBeenCalledWith();
      expect(mockHUSup.save).toHaveBeenCalledWith();
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
  
    test("moverArriba should return 200 when hu is the first", async () => {
      const req = { params: { project_id: "PR", id: "0" } };
      const res = mockRes();
  
      mockHU = {
          identificador: 0,
          titulo: "Completar sistema de autenticación de usuarios",
          project_id: "PR",
          orden: 1
        };
  
      HU.findOne.mockResolvedValueOnce(mockHU);
      HU.findOne.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(null)
      });
  
      await controller.moverArriba(req, res);
  
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
  
    test("moverArriba should return 404 when HU does not exist", async () => {
      const req = { params: { project_id: "PR", id: "0" } };
      const res = mockRes();
  
      HU.findOne.mockResolvedValueOnce(null);
      
      await controller.moverArriba(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("No encontrado");
    });
  
    test("moverAbajo should return 200", async () => {
      const req = { params: { project_id: "PR", id: "0" } };
      const res = mockRes();
  
      mockHU = {
          identificador: 0,
          titulo: "Completar sistema de autenticación de usuarios",
          project_id: "PR",
          orden: 0,
          save: jest.fn().mockResolvedValue(true) // Simula el save
        };
      mockHUInf = {
          identificador: 1,
          titulo: "Optimizar el rendimiento de consultas de base de datos",
          project_id: "PR",
          orden: 1,
          save: jest.fn().mockResolvedValue(true) // Simula el save
        };
      
      HU.findOne.mockResolvedValueOnce(mockHU);
      HU.findOne.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(mockHUInf)
      });
  
      await controller.moverAbajo(req, res);
  
      expect(mockHU.save).toHaveBeenCalledWith();
      expect(mockHUInf.save).toHaveBeenCalledWith();
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
  
    test("moverAbajo should return 200 when hu is the first", async () => {
      const req = { params: { project_id: "PR", id: "0" } };
      const res = mockRes();
  
      mockHU = {
          identificador: 0,
          titulo: "Completar sistema de autenticación de usuarios",
          project_id: "PR",
          orden: 1
        };
  
      HU.findOne.mockResolvedValueOnce(mockHU);
      HU.findOne.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(null)
      });
  
      await controller.moverAbajo(req, res);
  
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
  
    test("moverAbajo should return 404 when HU does not exist", async () => {
      const req = { params: { project_id: "PR", id: "0" } };
      const res = mockRes();
  
      HU.findOne.mockResolvedValueOnce(null);
      
      await controller.moverAbajo(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("No encontrado");
    });
  });

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
    expect(res.json).toHaveBeenCalledWith({ mensaje: "Se debe rellenar todos los campos obligatorios" });
  });

  test("crearCA should return 404 if HU is not found", async () => {
    const req = {
      params: { project_id: "PRJ", id: "1" },
      body: { texto: "Criterio de prueba", cuando: "Cuando PO", si: " si lo que sea ", entonces: "entonces ya sabes."}
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
      body: { texto: "Criterio de prueba", cuando: "Cuando PO", si: " si lo que sea ", entonces: "entonces ya sabes."}
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
      body: { texto: "Criterio de prueba", cuando: "Cuando PO", si: " si lo que sea ", entonces: "entonces ya sabes."}
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
});