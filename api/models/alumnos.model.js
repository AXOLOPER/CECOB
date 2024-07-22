const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  Matricula: { type: String, required: true },
  ASPIRANTE: { type: mongoose.Types.ObjectId, required: true, ref: "Aspirantes"},
  Status: { type: Boolean, default: true },
  Baja: {
    Administrativa: {
      Estado: { type: Boolean, default: false },
      Observaciones: {type:String,default:""}
    },
    Academica: {
      Estado: { type: Boolean, default: false },
      Observaciones: {type:String,default:""}
    },
    Financiera: {
      Estado: { type: Boolean, default: false },
      Observaciones: {type:String,default:""}
    },
  }

},{timestamps:true});

const Alumnos = mongoose.model('Alumnos', Schema);

module.exports = Alumnos;