const mongoose = require('mongoose');

const alumnoSchema = new mongoose.Schema({
  Matricula: { type: String, required: true },
  ASPIRANTE: { type: mongoose.Types.ObjectId, required: true, ref: "Aspirantes"},
  Status: { type: Boolean, default: true },
},{timestamps:true});

const Alumno = mongoose.model('Alumno', alumnoSchema);

module.exports = Alumno;