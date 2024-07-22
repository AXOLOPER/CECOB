const mongoose = require('mongoose');

const NSchema = new mongoose.Schema({
    usuario: {type:String},
    pass: { type: String },
    prestado:{type:mongoose.Types.ObjectId,ref:'Usuarios'},
    Status: {type:Boolean,default:false},
    fechaI: {type:Date},
    fechaF: {type:Date},
  });

const Licencia = mongoose.model('Licencia', NSchema);

module.exports = {
  Licencia
};