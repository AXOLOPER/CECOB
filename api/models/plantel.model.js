const mongoose = require('mongoose');

const plantelSchema = new mongoose.Schema({
  Clave:{type:String},
  Nombre:{type:String},
  Abreviatura:{type:String},
  Direccion:{type:String},
  Telefono:{type:String},
  Status:{type:Boolean, default:true},
});

const Plantel = mongoose.model('Plantel', plantelSchema);

module.exports = {
  Plantel
};