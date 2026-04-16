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

  test("createHU should return 201 on success", async () => {
    const req = { 
      params: { project_id: "PR" },
      body: { nombre: "Task A",  } 
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

  test("getHUById should return 404 when not found", async () => {
    const req = { params: { project_id: "PR", id: "0" } };
    const res = mockRes();

    HU.findById.mockResolvedValue(null);

    await controller.viewHU(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    console.log(res.render);
    expect(res.render).toHaveBeenCalledWith("HUs", {
      title: "Sprint Pilot - Backlog",
      hus: [],
      project_id: "PR",
      error: "HUs con identificador: 0 no se ha podido encontrar"
    });
  });
});