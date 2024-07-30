const mongoose = require('mongoose');

const licenciaSchema = new mongoose.Schema({
  usuario:{ type:String,unique: true,index:true },
  pass:{ type:String },
  fechaI:{ type:Date, default:undefined },
  fechaF:{ type:Date, default:undefined },
  prestado:{ type:mongoose.Types.ObjectId, ref:"Usuarios" },
  Status:{ type:Boolean, default:true }
});

const Licencia = mongoose.model('Licencia', licenciaSchema);

module.exports = { Licencia };