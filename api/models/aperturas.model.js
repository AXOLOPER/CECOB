const mongoose = require('mongoose');

const NSchema = new mongoose.Schema({
  Nombre: {type:String},
  ASPIRANTES: [{ type: mongoose.Types.ObjectId, required: true, ref: "Aspirantes"}],
  PLANTEL: { type: mongoose.Types.ObjectId, required: true, ref:"Plantel" },
  CARRERA: { type: mongoose.Types.ObjectId, required: true, ref:"Carrera" },
  GRADO: { type: mongoose.Types.ObjectId, required: true, ref:"Grado" },
  GRUPO: { type: mongoose.Types.ObjectId, ref:"Grupo" },
  TURNO: { type: mongoose.Types.ObjectId, required: true, ref:"Turno" },
  PERIODO: { type: mongoose.Types.ObjectId, required: true, ref:"Periodo" },
  disponible: { type: Boolean, default:true },
  lleno: { type: Boolean, default: false },
  dispuesto: { type: Boolean, default:false },
  abierto: { type: Boolean, default: false },
  cerrado: { type: Boolean, default: false },
  Status: { type: Boolean, default: true },
},{timestamps:true});

const Aperturas = mongoose.model('Aperturas', NSchema);

module.exports = Aperturas;