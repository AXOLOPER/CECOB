const Modelo = require('../models/candidatos.model');
const BitacoraController = require("./bitacora.controller");

async function create(req, res) {
  try {
    const NewReg = new Modelo(req.body);
    await NewReg.save();
    if(NewReg){
      BitacoraController.registrar("registro al prospecto con id: "+NewReg.id);
    }
    res.status(201).json(NewReg);
  } catch (error) {
    console.error('Error al guardar el prospecto:', error);
    res.status(500).json({ error: 'Ocurrió un error al guardar el prospecto' });
  }
};

async function readAll  (req, res) {
  const all = await Modelo.find();
  return res.status(200).json(all);
}

async function read1(req, res){
  const { id } = req.params;
  const Find = await Modelo.findOne({CURP:id});
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