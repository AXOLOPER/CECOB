const {Licencia} = require('../models/licencias.model');
const Modelo = Licencia;
const text = "la licencia"
const BitacoraController = require("./bitacora.controller");

async function create(req, res) {
  try {
    const nuevo = new Modelo();
    nuevo.usuario = req.body.usuario;
    nuevo.pass = req.body.pass;
    const saved = await nuevo.save();
  if(saved){
      BitacoraController.registrar("registró "+text+" "+saved.Nombre+" con id: "+saved._id, req.usuario.id);
    }
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error al guardar '+text+':', error);
    res.status(500).json({ error: 'Ocurrió un error al guardar '+text });
  }
};

async function readAll  (req, res) {
  const all = await Modelo.find();
  return res.status(200).json(all);
}

async function read1(req, res){
  const { id } = req.params;
  const prospecto = await Modelo.findById(id);
  return res.status(200).json(prospecto);
}

async function loan(req, res) {
  const id = req.usuario.id;
  console.log(new Date(Date.now()));
  let loaned = await Modelo.findOne({prestado:id});
  if (!loaned) { 
    loaned = await Modelo.findOneAndUpdate({ $or: [{ Status: false }, { fechaF: { $lt: new Date(Date.now()) } }] }, { Status: true, fechaI: new Date(Date.now()), fechaF: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), prestado: id });
  }
  if (loaned) {
    loaned = await Modelo.findById(loaned._id).populate("prestado");
    return res.status(200).json(loaned);
  }
  return res.status(201).json({ message:"No hay licencias disponibles"});
}

async function update(req, res){
  try {
    const id = req.body._id;
    const updated = await Modelo.findByIdAndUpdate(id, req.body);
  if(updated){
      BitacoraController.registrar("actualizó "+text+" con id: "+updated._id, req.usuario.id);
    }
    res.status(201).json(updated);
  } catch (error) {
    console.error('Error al guardar '+text+':', error);
    res.status(500).json({ error: 'Ocurrió un error al guardar '+text });
  }
}

async function del(req, res){
  try {
    const { id } = req.params;
    const found = await Modelo.findById(id);
    const deleted = await Modelo.findByIdAndUpdate(id,{Status:!found.Status});
  if(deleted){
      BitacoraController.registrar("eliminó "+text+" con id: "+deleted._id, req.usuario.id);
    }
    res.status(201).json(deleted);
  } catch (error) {
    console.error('Error al eliminar '+text+':', error);
    res.status(500).json({ error: 'Ocurrió un error al eliminar '+text });
  }
}

module.exports={
  create,
  readAll,
  read1,
  loan,
  update,
  del
}