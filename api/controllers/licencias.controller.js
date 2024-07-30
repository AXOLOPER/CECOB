const {Licencia} = require('../models/licencias.model');
const Modelo = Licencia;
const text = "la licencia"
const BitacoraController = require("./bitacora.controller");

async function create(req, res) {
  try {
    const nuevo = new Modelo(req.body);
    const saved = await nuevo.save();
  if(saved){
      BitacoraController.registrar("registró "+text+" "+saved.usuario+" con id: "+saved.id, req.usuario.id);
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

async function update(req, res){
  try {
    const id = req.body._id;
    const updated = await Modelo.findByIdAndUpdate(id, req.body);
  if(updated){
      BitacoraController.registrar("actualizó "+text+" con id: "+updated.id, req.usuario.id);
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
      BitacoraController.registrar("eliminó "+text+" con id: "+deleted.id, req.usuario.id);
    }
    res.status(201).json(deleted);
  } catch (error) {
    console.error('Error al eliminar '+text+':', error);
    res.status(500).json({ error: 'Ocurrió un error al eliminar '+text });
  }
}

async function loan(req, res) {
  const usuario = req.usuario.id;
  let currentDate = new Date();

  let updated = await Modelo.findOneAndUpdate({ fechaF: { $lt: currentDate } }, { fechaI: null, fechaF: null, Status: false,prestado:null},{new:true})

  let found = await Modelo.findOne({
    prestado: usuario
  });

  if (!found) {
    found = await Modelo.findOneAndUpdate({ Status: false },{fechaI:currentDate,fechaF:new Date(Date.now()+(7*24*60*60*1000)),Status:true,prestado:usuario},{new:true});
  }

  if (!found) {
    found = {usuario:"NO HAY LICENCIAS DISPONIBLES",pass:"",}
  }

  return res.status(200).json(found);
}

module.exports={
  create,
  readAll,
  read1,
  update,
  del,
  loan
}