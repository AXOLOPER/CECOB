const Modelo = require('../models/aspirantes.model');
const Candidato = require('../models/candidatos.model');
const BitacoraController = require("./bitacora.controller");

async function create(req, res) {
  try {
    const {CURP,CARRERA,GRADO,GRUPO,TURNO,PERIODO} = req.body;
    let candidato = await Candidato.findOne({CURP:CURP});
    const NewReg = new Modelo();
    NewReg.CURP = CURP;
    NewReg.CANDIDATO = candidato.id;
    NewReg.CARRERA = CARRERA;
    NewReg.GRADO = GRADO;
    NewReg.GRUPO = GRUPO;
    NewReg.TURNO = TURNO;
    NewReg.PERIODO = PERIODO;
    const registered = await NewReg.save();
    if(registered){
      BitacoraController.registrar("registro al aspirante con id: "+registered._id,req.usuario.id);
    }
    res.status(201).json(registered);
  } catch (error) {
    console.error('Error al guardar el aspirante:', error);
    res.status(500).json({ error: 'Ocurrió un error al guardar el aspirante' });
  }
};

async function readAll  (req, res) {
  const SORT = { sort: [['CARRERA.Nombre', 'asc' ]] };
  const all = await Modelo.find()
  .populate("CANDIDATO")
  .populate("CARRERA")
  .populate("GRADO")
  .populate("GRUPO")
  .populate("TURNO")
  .populate("PERIODO")
  .sort("CARRERA.Abreviatura");
  return res.status(200).json(all);
}

async function read1(req, res){
  const { id } = req.params;
  const Find = await Modelo.findOne({CURP:id})
  .populate("CANDIDATO")
  .populate("CARRERA")
  .populate("GRADO")
  .populate("GRUPO")
  .populate("TURNO")
  .populate("PERIODO")
  .sort("CARRERA.Abreviatura");
  return res.status(200).json(Find);
}

async function update(req, res){
  const { _id } = req.body;
  const updated = await Modelo.findByIdAndUpdate(_id,req.body);
  if(updated){
    BitacoraController.registrar("registro al aspirante con id: "+updated.id,req.usuario.id);
  }
  return res.status(200).json(updated);
}

async function del(req, res){
  const { id } = req.params;
  const user = await Modelo.findById(id);
  const deleted = await Modelo.findByIdAndUpdate(id,{Status:!user.Status});
  if(deleted){
    BitacoraController.registrar("registro al aspirante con id: "+deleted.id,req.usuario.id);
  }
  return res.status(200).json(deleted);
}

module.exports={
  create,
  readAll,
  read1,
  update,
  del
}