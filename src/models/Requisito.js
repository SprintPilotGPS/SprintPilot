const mongoose = require("mongoose");

const requisitoSchema = new mongoose.Schema(
  {
    identificador: {
      type: Number,
      required: true,
      immutable: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    prioridad: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    estado: {
      type: String,
      enum: ["in-progress", "pending", "completed"],
      default: "pending",
    },
    responsable: {
      type: String,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    project_id: {
      type: String,
      required: true,
      immutable: true,
    },
    orden: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

requisitoSchema.index(
  { project_id: 1, identificador: 1 },
  { unique: true, name: "project_id_1_identificador_1" }
);
/* requisitoSchema.pre("validate", async function nextId() {
  if (!this.isNew || this.identificador) return;
  if (this.isNew && this.orden === undefined) {
    const total = await mongoose.model("Requisito").countDocuments();
    this.orden = total;
  }
  const counter = await Counter.findByIdAndUpdate(
    "requisito_identificador",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.identificador = counter.seq;
}); */

module.exports = mongoose.model("Requisito", requisitoSchema);
