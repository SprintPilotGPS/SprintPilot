const controller = require("../../src/controllers/requisitoController");
const Requisito = require("../../src/models/Requisito");

jest.mock("../../src/models/Requisito", () => {
  const MockRequisito = jest.fn();
  MockRequisito.findById = jest.fn();
  MockRequisito.findByIdAndUpdate = jest.fn();
  MockRequisito.findByIdAndDelete = jest.fn();
  return MockRequisito;
});

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  return res;
}

describe("requisitoController unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createRequisito should return 201 on success", async () => {
    const req = { body: { nombre: "Task A" } };
    const res = mockRes();

    const save = jest.fn().mockResolvedValue(undefined);
    Requisito.mockImplementation(function MockCtor(data) {
      this.save = save;
      Object.assign(this, data);
    });

    await controller.createRequisito(req, res);

    expect(Requisito).toHaveBeenCalledWith(req.body);
    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test("getRequisitoById should return 404 when not found", async () => {
    const req = { params: { id: "507f1f77bcf86cd799439011" } };
    const res = mockRes();

    Requisito.findById.mockResolvedValue(null);

    await controller.getRequisitoById(req, res);

    expect(Requisito.findById).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
