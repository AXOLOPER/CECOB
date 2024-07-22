'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PagoSchema = Schema({
    cobro: { type: Number, require:true },
    beca: { type: Number },
    costo: { type: Number},
    cantidad: { type: Number, require: true },
    referencia: { type: String },
    observacion: { type: String },
}, { collection: 'Pago' },{ timestamps: true });

var FPagosSchema = Schema({
    position:{type: Number, require:true},
    texto:{type:String, require:true},
    estado:{type:Boolean, default:true}
},{collection:'FPagos'},{timestamps:true});

var BancosSchema = Schema({
    position:{type: Number, require:true},
    texto:{type:String, require:true},
    estado:{type:Boolean, default:true}
},{collection:'Bancos'},{timestamps:true});

var PagosSchema = Schema({
    fecha: { type: Date, require:true },
    folio: { type: Number, unique:true, require:true },
    alumno: { type: String, ref: 'Alumno', require: true },
    fPago: { type: Schema.Types.ObjectId, ref: 'FPagos', require:true},
    banco: { type: Schema.Types.ObjectId, ref: 'Bancos'},
    pagos: [ { type: Schema.Types.ObjectId, ref: 'Pago', require:true } ],
    total: { type: Number },
    pago: { type: Number },
    observacion: { type: String },
}, { collection: 'Pagos' },{ timestamps: true });

module.exports = {
    FPagos:mongoose.model('FPagos', FPagosSchema),
    Bancos:mongoose.model('Bancos', BancosSchema),
    Pago:mongoose.model('Pago', PagoSchema),
    Pagos:mongoose.model('Pagos', PagosSchema)
};