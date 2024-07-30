const Modelo = require('../models/alumnos.model');
const Calumno = require('../models/alumnosAc.model');
const Aspirante = require('../models/aspirantes.model');
const BitacoraController = require("./bitacora.controller");
const path = require('path');

async function createMany(req, res) {
  try {
    let Aspi = req.body.Aspirantes;
    for (let index = Aspi.length; index > 0; index--) {
      let element = Aspi[index-1]
      const CURP = element;
      let ASPIRANTE = await Aspirante.findOne({ CURP: CURP })
        .populate("GRADO")
        .populate("GRUPO")
        .populate("TURNO")
        .populate("CARRERA")
        .populate("PERIODO")
        .populate("PLANTEL");
      //.populate("REVALIDANTE");
      let MatriculaSearch = "000000000XXXXX";
      let MatRegEx = undefined;
      let Search = {};
      if (ASPIRANTE) {
        let cveGrupo = ASPIRANTE.GRUPO?.Clave || "X";
        let cveTurno = ASPIRANTE.TURNO.Abreviatura;
        let cveCarrera = ASPIRANTE.CARRERA.Clave;
        let cvePlantel = ASPIRANTE.PLANTEL.Clave||"XXXXX";
        let cvePeriodo = "0"+ASPIRANTE.PERIODO.Clave.slice(-1);
        let cveYear = ASPIRANTE.PERIODO.Clave.slice(0, 2);
        
        let MatIni = cveCarrera + cvePeriodo + cveYear;
        //let MatCons = ;
        let MatFin = cveTurno + cveGrupo + cvePlantel;

        MatriculaSearch =  MatIni+ "000" + MatFin;
        MatRegEx = new RegExp("^"+MatIni + '\\d{3}' + MatFin+"$");
        Search = { 'Matricula': { $regex: MatRegEx } };
      }

      let lastMat = await Modelo.findOne(Search).sort('-Matricula').limit(1); 
      if (!lastMat) {
        lastMat = { Matricula: '' };
        lastMat.Matricula = MatriculaSearch;
      }
      const NewReg = new Modelo();
      let s = lastMat.Matricula.slice(6, 9);
      let mas = parseInt(s);
      let masmas = parseInt(mas + 1);
      let masmasmas = ("00" + masmas.toString()).slice(-3);
      NewReg.Matricula = lastMat.Matricula.slice(0,6)+masmasmas+lastMat.Matricula.slice(-7);
      NewReg.CURP = CURP;
      NewReg.ASPIRANTE = ASPIRANTE._id;
      const registered = await NewReg.save();
      if (registered) {
        const CALUMNO = new Calumno();
        CALUMNO.Matricula = registered.Matricula;
        CALUMNO.ALUMNO = registered._id;
        CALUMNO.Nuuts = "$2b$10$.09OE.2orFT73EUD1C4La.8l0aHCCttUp04cRNWWKr.wHv87xdpfC";
        CALUMNO.privilegios = { ALUMNO: true };
        CALUMNO.Status = true;
        await CALUMNO.save();
        BitacoraController.registrar("registro al alumno con id: " + registered._id, req.usuario.id);
      }
        
      };
      res.status(201).json();
  } catch (error) {
    console.error('Error al guardar el alumno:', error);
    res.status(500).json({ error: 'Ocurrió un error al guardar el alumno' });
  }
};

async function readAll  (req, res) {
  const SORT = {'ASPIRANTE.PERIODO.FechaIni':1,'ASPIRANTE.CARRERA.Nombre':1,'ASPIRANTE.GRADO.NUMERO':1,'ASPIRANTE.GRUPO.Nombre':1,'ASPIRANTE.TURNO.Nombre':1};
  const all = await Modelo.find()
    .populate({ 
     path: 'ASPIRANTE',
     populate: {
       path: 'CANDIDATO',
       model: 'Candidatos'
     }
    })
    .populate({
     path: 'ASPIRANTE',
     populate: {
       path: 'CARRERA',
       model: 'Carrera'
     }
  }).populate({ 
     path: 'ASPIRANTE',
     populate: {
       path: 'GRADO',
       model: 'Grado'
     }
  }).populate({ 
     path: 'ASPIRANTE',
     populate: {
       path: 'GRUPO',
       model: 'Grupo'
     }
  }).populate({ 
     path: 'ASPIRANTE',
     populate: {
       path: 'TURNO',
       model: 'Turno'
     }
  }).populate({ 
     path: 'ASPIRANTE',
     populate: {
       path: 'PERIODO',
       model: 'Periodo'
     }
  }).populate({ 
     path: 'ASPIRANTE',
     populate: {
       path: 'PLANTEL',
       model: 'Plantel'
     }
  }).sort(SORT);
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
    BitacoraController.registrar("registro al aspirante con id: " + updated._id, req.usuario.id);
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
  const Find = await Modelo.findOne({ CURP: CURP })
    .populate({ path: "ASPIRANTE", populate: { path: "CANDIDATO" } })
    .populate({ path: "PERIODO"})
    .populate({ path: "GRADO"})
    .populate({ path: "GRUPO"})
    .populate({ path: "TURNO"});
  
  if(Find)
    return res.status(200).json(Find);
  
  return res.status(204).json();
}

async function readDisponibles(req,res) {
  const founds = await Modelo.find().populate("ASPIRANTE");
  const all = await Aspirante.find({Inscrito:true})
  .populate("CANDIDATO")
  .populate("CARRERA")
  .populate("GRADO")
  .populate("GRUPO")
  .populate("TURNO")
  .populate("PERIODO")
  .populate("PLANTEL");
  const ret = all.filter((x) => {
    let found = false;
    founds.forEach(r => {
      r.ASPIRANTE.CURP === x.CURP ? found = true:{};
    });
    return !found;
  }); 
  return res.status(200).json(ret);
}

module.exports={
  createMany,
  readAll,
  read1,
  readCURP,
  update,
  del,
  sendPDF,
  readDisponibles
}