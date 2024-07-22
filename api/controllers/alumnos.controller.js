const Modelo = require('../models/alumnos.model');
const Aspirante = require('../models/aspirantes.model');
const BitacoraController = require("./bitacora.controller");
const path = require('path');

async function create(req, res) {
  try {
    const {CURP, Matricula, Status,baja} = req.body;
    let aspirante = await Aspirante.findOne({CURP:CURP});
    const NewReg = new Modelo();
    NewReg.CURP = CURP;
    NewReg.ASPIRANTE = aspirante._id;
    NewReg.Matricula = Matricula;
    NewReg.Status = Status;
    NewReg.Baja = baja||undefined;
    const registered = await NewReg.save();
    if(registered){
      BitacoraController.registrar("registro al Alumno con id: " + registered._id, req.usuario.id);
    }
    res.status(201).json(registered);
  } catch (error) {
    console.error('Error al guardar el Alumno:', error);
    res.status(500).json({ error: 'Ocurrió un error al guardar el Alumno' });
  }
};

async function readAll  (req, res) {
  const POPULATE = { path:'ASPIRANTE', populate:{path:"CARRERA"}};
  const SORT = [['ASPIRANTE.CARRERA.Nombre', 'asc'], ['ASPIRANTE.CARRERA.Abreviatura', 'asc']];
  const all = await Modelo.find()
  .populate(POPULATE)
  .sort(SORT);
  return res.status(200).json(all);
}

async function read1(req, res){
  const { id } = req.params;
  const Find = await Modelo.findOne({ _id: id })
    .populate("ASPIRANTE")
    .populate("CARRERA")
    .populate("GRADO")
    .populate("GRUPO")
    .populate("TURNO")
    .populate("PERIODO")
    .populate("PLANTEL");
  return res.status(200).json(Find);
}

async function sendPDF(req, res) {
  const CURP = req.body.CURP;
  const PDFPATH = path.join(__dirname, '..' + "/PDFS/" + CURP + ".pdf");
  console.log(PDFPATH);
  
  var fs = require('fs');

  //if (!fs.existsSync(PDFPATH)) {
    await CandidatosController.Print(req,res,CURP);
  //}

  return res.status(200).sendFile(PDFPATH);
};

async function update(req, res){
  const { _id } = req.body;
  req.body.GRUPO = req.body.GRUPO?req.body.GRUPO:null;
  const updated = await Modelo.findByIdAndUpdate(_id,req.body);
  if(updated){
    BitacoraController.registrar("registro al Alumno con id: " + updated._id, req.usuario.id);
    await CandidatosController.Print(req,res,updated.CURP);
  }
  return res.status(200).json(updated);
}

async function del(req, res){
  const { id } = req.params;
  const user = await Modelo.findById(id);
  const deleted = await Modelo.findByIdAndUpdate(id,{Status:!user.Status});
  if(deleted){
    BitacoraController.registrar("registro al Alumno con id: "+deleted.id,req.usuario.id);
  }
  return res.status(200).json(deleted);
}

async function readCURP(req, res) {
  const { CURP } = req.params;
  const Find = await Modelo.findOne({ CURP: CURP });
  
  if(Find)
    return res.status(200).json(Find);
  
  return res.status(204).json();
}

module.exports={
  create,
  readAll,
  read1,
  readCURP,
  update,
  del,
  sendPDF
}