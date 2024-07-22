const mongoose = require('mongoose');

const CalumnoSchema = new mongoose.Schema({
  Matricula: { type: String, required: true },
  ALUMNO: { type: mongoose.Types.ObjectId, required: true, ref: "Alumnos"},
  Nuuts: { type: String, required: true },
  privilegios: {ALUMNO:{ type:Boolean }},
  Status: { type: Boolean, default: true },
},{timestamps:true});

const CuentaAlumno = mongoose.model('CuentaAlumno', CalumnoSchema);

module.exports = CuentaAlumno;