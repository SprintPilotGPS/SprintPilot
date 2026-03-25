const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

const requisitoSchema = new mongoose.Schema(
  {
    identificador: {
      type: Number,
      required: true,
      unique: true,
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
    orden: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

requisitoSchema.pre("validate", async function nextId() {
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
});

module.exports = mongoose.model("Requisito", requisitoSchema);
