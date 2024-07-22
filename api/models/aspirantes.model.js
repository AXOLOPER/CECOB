const mongoose = require('mongoose');
  const Docs = [
    {
      Nombre: "Acta de nacimiento o equivalente",
      Original: false,
      Copia: false
    }, {
      Nombre: "Certificado de secundaria o equivalente",
      Original: false,
      Copia: false
    }, {
      Nombre: "Certificado de bachillerato o equivalente",
      Original: false,
      Copia: false
    }, {
      Nombre: "Carta de validacion de certificado de bachillerato",
      Original: false,
      Copia: false
    }, {
      Nombre: "Certificado de licenciatura o equivalente",
      Original: false,
      Copia: false
    }, {
      Nombre: "Carta de autorizacion de titulacion por creditos",
      Original: false,
      Copia: false
    }, {
      Nombre: "Titulo",
      Original: false,
      Copia: false
    }, {
      Nombre: "Cedula de licenciatura",
      Original: false,
      Copia: false
    }, {
      Nombre: "CURP",
      Original: false,
      Copia: false
    }, {
      Nombre: "Carta de buena conducta o recomendacion",
      Original: false,
      Copia: false
    }, {
      Nombre: "Certificado medico",
      Original: false,
      Copia: false
    }, {
      Nombre: "Comprobante de domicilio",
      Original: false,
      Copia: false
    }, {
      Nombre: "Certificado para tramite de equivalencia",
      Original: false,
      Copia: false
    }, {
      Nombre: "Resolucion de equivalencia",
      Original: false,
      Copia: false
    }, {
      Nombre: "Fotografias",
      Original: false,
      Copia: false
    }
  ];

const aspirantesSchema = new mongoose.Schema({
  CURP: { type: String, required: true},
  CANDIDATO: { type: mongoose.Types.ObjectId, required: true, ref: "Candidatos"},
  CARRERA: { type: mongoose.Types.ObjectId, required: true, ref:"Carrera" },
  GRADO: { type: mongoose.Types.ObjectId, required: true, ref:"Grado" },
  GRUPO: { type: mongoose.Types.ObjectId, ref:"Grupo" },
  TURNO: { type: mongoose.Types.ObjectId, required: true, ref:"Turno" },
  PERIODO: { type: mongoose.Types.ObjectId, required: true, ref:"Periodo" },
  PLANTEL: { type: mongoose.Types.ObjectId, ref:"Plantel" },
  DOCUMENTOS:{type:[{
    Nombre:{type:String},
    Original:{type:Boolean,default:false},
    Copia:{type:Boolean,default:false}
  }], default: Docs
  },
  Inscrito: { type: Boolean, default: false },
  Status: { type: Boolean, default: true },
},{timestamps:true});

const Aspirantes = mongoose.model('Aspirantes', aspirantesSchema);

module.exports = Aspirantes;