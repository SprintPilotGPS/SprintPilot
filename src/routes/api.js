const express = require("express");
const router = express.Router();
const requisitoController = require("../controllers/requisitoController");

// API routes for requisitos
router.post("/requisitos", requisitoController.createRequisito);
router.get("/requisitos/:id", requisitoController.getRequisitoById);
router.put("/requisitos/:id", requisitoController.updateRequisito);
router.delete("/requisitos/:id", requisitoController.deleteRequisito);
router.post("/requisitos/:id/mover-arriba", requisitoController.moverArriba);
router.post("/requisitos/:id/mover-abajo", requisitoController.moverAbajo);


module.exports = router;
