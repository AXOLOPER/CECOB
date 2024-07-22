const Modelo = require('../models/aperturas.model');
const BitacoraController = require("./bitacora.controller");

label = "la apertura";

async function create(req, res) {
  try {
    const {
      Nombre,
      ASPIRANTES,
      PLANTEL,
      CARRERA,
      GRADO,
      GRUPO,
      TURNO,
      PERIODO,
      disponible,
      lleno,
      dispuesto,
      abierto,
      cerrado,
      Status
    } = req.body;
    const NewReg = new Modelo();
    NewReg.Nombre = Nombre;
    NewReg.ASPIRANTES = ASPIRANTES;
    NewReg.PLANTEL = PLANTEL;
    NewReg.CARRERA = CARRERA;
    NewReg.GRADO = GRADO;
    NewReg.GRUPO = GRUPO;
    NewReg.TURNO = TURNO;
    NewReg.PERIODO = PERIODO;
    NewReg.disponible = disponible;
    NewReg.lleno = lleno;
    NewReg.dispuesto = dispuesto;
    NewReg.abierto = abierto;
    NewReg.cerrado = cerrado;
    NewReg.Status = Status;
    
    const registered = await NewReg.save();
    if(registered){
      BitacoraController.registrar("registro "+label+" con id: "+registered._id,req.usuario.id);
    }
    res.status(201).json(registered);
  } catch (error) {
    console.error('Error al guardar '+label+':', error);
    res.status(500).json({ error: 'Ocurrió un error al guardar '+label+'' });
  }
};

async function readAll  (req, res) {
  const SORT =  [['PLANTEL.Nombre', 1 ]];
  const all = await Modelo.find()
  .populate("ASPIRANTES")
  .populate("CARRERA")
  .populate("GRADO")
  .populate("GRUPO")
  .populate("TURNO")
  .populate("PERIODO")
  .populate("PLANTEL")
  .sort(SORT);
  return res.status(200).json(all);
}

async function read1(req, res){
  const { id } = req.params;
  const Find = await Modelo.findOne({_id:id})
  .populate("CANDIDATO")
  .populate("CARRERA")
  .populate("GRADO")
  .populate("GRUPO")
  .populate("TURNO")
  .populate("PERIODO")
  .populate("PLANTEL")
  .sort("CARRERA.Abreviatura");
  return res.status(200).json(Find);
}

async function update(req, res){
  const { _id } = req.body;
  req.body.GRUPO = req.body.GRUPO?req.body.GRUPO:undefinded;
  const updated = await Modelo.findByIdAndUpdate(_id,req.body);
  if(updated){
    BitacoraController.registrar("registro al aspirante con id: " + updated._id, req.usuario.id);
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
  del,
}