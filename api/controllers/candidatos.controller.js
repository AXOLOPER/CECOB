const Modelo = require('../models/candidatos.model');
const Aspirante = require('../models/aspirantes.model');

const mongoose = require("mongoose");
const BitacoraController = require("./bitacora.controller");


const path = require('path');

async function create(req, res) {
  try {
    const NewReg = new Modelo(req.body);
    await NewReg.save();
    if (NewReg) {
      BitacoraController.registrar("registro al prospecto con id: " + NewReg.id);
    }
    res.status(201).json(NewReg);
  } catch (error) {
    console.error('Error al guardar el prospecto:', error);
    res.status(500).json({ error: 'Ocurrió un error al guardar el prospecto' });
  }
};

async function Inscripcion(req, res) {
  try {
    // Using Mongoose's default connection
    const session = await mongoose.startSession();

    session.startTransaction({ readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
    try {
      let Candidato = new Modelo(req.body.CANDIDATO);
      Candidato._id = new mongoose.Types.ObjectId();
      let AspiranteD = new Aspirante(req.body);
      let NCandidato = await Candidato.save();
      AspiranteD.CANDIDATO = NCandidato.id;
      let NAspirante = await AspiranteD.save();

      if (NAspirante.id) {

        session.commitTransaction();
        if(NAspirante){
          BitacoraController.registrar("Se inscribio al prospecto con id: " + NAspirante.id, "65e5dea058d9c1c0f683869d");
          
          try {
            
              let RES = await Aspirante.findById(NAspirante.id)
                .populate("CANDIDATO")
                .populate("CARRERA")
                .populate("GRADO")
                .populate("GRUPO")
                .populate("TURNO")
                .populate("PERIODO");
              
              let PDF = await Print(req, res, RES.CURP);
            console.log("PDF: " + PDF);
            res.contentType("application/pdf");
            return res.sendFile(PDF);
          } catch (error) {
            console.log("Error al generar el PDF: " + error);
          }
        }
      }
     } catch (
      error
    ) {
      console.log("Error: al Inscribri al alumno...: "+error);
      session.abortTransaction();
      return res.status(500).json({ error: 'Ocurrió un error al realizar la inscripcion: '+ error });
    }
    
    // const NewReg = new Modelo(req.body);
    // await NewReg.save();
    // if(NewReg){
    //   BitacoraController.registrar("registro al prospecto con id: "+NewReg.id);
    // }
    // res.status(201).json(NewReg);
  } catch (error) {
    console.error('Error al guardar el prospecto:', error);
    return res.status(500).json({ error: 'Ocurrió un error al guardar el prospecto' });
  }
};

async function readAll  (req, res) {
  const all = await Modelo.find();
  return res.status(200).json(all);
}

async function read1(req, res) {
  const { id } = req.params;
  const Find = await Modelo.findById(id);
  return res.status(200).json(Find);
}

async function update(req, res) {
  const { _id } = req.body;
  const updated = await Modelo.findByIdAndUpdate(_id, req.body);
  if (updated) {
    BitacoraController.registrar("registro al aspirante con id: " + updated.id, req.usuario.id);
  }
  return res.status(200).json(updated);
}

async function del(req, res) {
  const { id } = req.params;
  const user = await Modelo.findById(id);
  const deleted = await Modelo.findByIdAndUpdate(id, { Status: !user.Status });
  if (deleted) {
    BitacoraController.registrar("registro al aspirante con id: " + deleted.id, req.usuario.id);
  }
  return res.status(200).json(deleted);
}

const { default: puppeteer } = require('puppeteer');
var fs = require('fs');
const { APIHOST } = require('../config');

async function Acuerdo(req, res) {
  const { CURP } = req.params;

  const Data = await Aspirante.findOne({ CURP: CURP })
                .populate("CANDIDATO")
                .populate("CARRERA")
                .populate("GRADO")
                .populate("GRUPO")
                .populate("TURNO")
                .populate("PERIODO");
  
  const name = "SOLICITUD DE INSCRIPCION";
  
  const {
    createdAt,
    CARRERA,
    GRADO,
    GRUPO,
    TURNO,
    PERIODO,
    MATRICULA,
    CANDIDATO,
    Status
  } = Data;

  PLANTEL = Data.PLANTEL? Data.PLANTEL:{ Nombre: "Plantel de prueba" };
  if (!Data) { 
    return;
  }
  var today = createdAt ? new Date(createdAt) : new Date();
  var birthday = CANDIDATO.FNac ? new Date(CANDIDATO.FNac) : new Date();
    //Restamos los años
    let años = today.getFullYear() - birthday.getFullYear();
    // Si no ha llegado su cumpleaños le restamos el año por cumplir (Los meses en Date empiezan en 0, por eso tenemos que sumar 1)
    if (birthday.getMonth() > (today.getMonth()) || birthday.getDay() > today.getDay())
        años--;
  const Edad = años;
  
    if(!Status){
      return res.status(403).send("Datos Incompletos");
    }
  
    let header = fs.readFileSync(path.join(__dirname,"..","/PDF/header.html"));
    let content = `
      <body  class="hoja">
      <!--<mat-grid-list cols="9" rowHeight="5rem"> -->
      <fieldset class="fhide">
        <table>
          <tr>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
          </tr>
          <tr>
            <td colspan="2" rowspan="3">
              <div style="display: block;" class="imagen">
                <img src="https://sic.cultura.gob.mx/images/62936" style="width:70mm;" />
              </div>
            </td>
            <td></td>
            <td colspan="5" rowspan="5">
              ${name || "SOLICITUD DE INSCRIPCION"}
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td colspan="2" rowspan="5">
              FOTO
            </td>
            <td></td>
          </tr>
          <tr></tr>
          <tr></tr>
          <tr>
            <td colspan="2">
              FECHA: ${new Date(createdAt).toLocaleDateString()}
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colspan="2">
              Porcentage de Beca:
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colspan="9">Programa de estudios: ${CARRERA.Nombre || "Carrera de prueba"}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colspan="5">Grado: ${GRADO.Nombre || "Grado de prueba"}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td colspan="4">Grupo: ${GRUPO.Nombre || "Grupo de prueba"}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colspan="5">Turno: ${TURNO.Nombre || "Turno de prueba"}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td colspan="4">Periodo: ${PERIODO.Nombre || "Periodo de prueba"}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colspan="5">Plantel: ${PLANTEL?.Nombre || "Plantel de prueba"}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td colspan="4">Matricula: ${MATRICULA || "MATRICULA de prueba"}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </table>
      </fieldset>
    <br/>
      <fieldset>
        <legend>DATOS DEL ALUMNO</legend>
        <table>
          <tr>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
            <th><span></span></th>
          </tr>
          <tr>
            <td colspan="3">
              Primer Apellido:<br/>
              ${CANDIDATO.ApellidoP}
            </td>
            <td></td>
            <td></td>
            <td colspan="3">
              Segundo Apellido:<br />
              ${CANDIDATO.ApellidoM}
            </td>
            <td></td>
            <td></td>
            <td colspan="3">
              Nombre(s):<br />
              ${CANDIDATO.Nombres}
            </td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colspan="6">
              Correo electronico:<br/>
              ${CANDIDATO.Email}
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td colspan="3">
              CURP:<br/>
              ${CANDIDATO.CURP}
            </td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colspan="3">
              Sexo:<br/>
              ${CANDIDATO.Sexo||""}
            </td>
            <td></td>
            <td></td>
            <td colspan="3">
              Edad:<br>
              ${Edad||""}
            </td>
            <td></td>
            <td></td>
            <td>
              Estado civil:<br/>
              ${CANDIDATO.EstCivil||""}
            </td>
            <td></td>
            <td></td>
          </tr>
        </table>
      </fieldset>
    <br />
    <fieldset>
      <table>
        <tr>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
        </tr>
        <tr>
          <td colspan="5">
            Lugar de Nacimiento: ${CANDIDATO.LNac}
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td colspan="4">
            Fecha de Nacimiento: ${new Date(CANDIDATO.FNac).toLocaleDateString()}
          </td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </table>
    </fieldset>
    <br />
    <fieldset>
      <legend>DOMICILIO</legend>
      <table>
        <tr>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
        </tr>
        <tr>
          <td colspan="9">
            Direccion:${CANDIDATO.Domicilio}
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="3">
            Colonia:<br />
            ${CANDIDATO.Colonia||""}
          </td>
          <td></td>
          <td></td>
          <td colspan="3">
            Municipio:<br />
            ${CANDIDATO.Municipio}
          </td>
          <td></td>
          <td></td>
          <td colspan="3">
            Entidad federativa:<br />
            ${CANDIDATO.Estado}
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="3">
            Pais:<br />
            ${CANDIDATO.Pais}
          </td>
          <td></td>
          <td></td>
          <td colspan="3">
            Telefono movil:<br />
            ${CANDIDATO.Cel}
          </td>
          <td></td>
          <td></td>
          <td colspan="3">
            Telefono fijo:<br />
            ${CANDIDATO.Tel}
          </td>
          <td></td>
          <td></td>
        </tr>
      </table>
    </fieldset>

    <br />
    <fieldset>
      <legend>Datos de emergencia</legend>
      <table>
        <tr>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
          <th><span></span></th>
        </tr>
        <tr>
          <td colspan="3">
            Padece alguna Enfermedad:${CANDIDATO.Padece? "SI":"NO"}
          </td>
          <td></td>
          <td></td>
          <td colspan="3">
            ${CANDIDATO.Padece? "Cual?:":""} ${CANDIDATO.Enfermedad}
          </td>
          <td></td>
          <td></td>
          <td colspan="3">
            Que medicamento tomas?:${CANDIDATO.Medicamento?CANDIDATO.Medicamento:"Ninguno"}
          </td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td colspan="3">
            En caso de emergencia avisar a:<br />
            ${CANDIDATO.EmergenciaNombre}
          </td>
          <td></td>
          <td></td>
          <td colspan="3">
            Telefono:<br />
            ${CANDIDATO.EmergenciaTel}
          </td>
          <td></td>
          <td></td>
          <td colspan="3">
            Parentesco:<br />
            ${CANDIDATO.EmergenciaParentesco}
          </td>
          <td></td>
          <td></td>
        </tr>
      </table>
    </fieldset>

    <br />
    <fieldset class="fhide">
      <table>
        <tr>
          <td colspan="9" class="justify">
                Es de mi conocimiento que el tramite de inscripcion se considera completo
                cuando se entrega la totalidad de los documentos de inscripcion
                y se realiza el pago correspondiente. Conozco y acepto los reglamentos y
                lineamientos que establece UNIVER Arandas. <br />
                Bajo protesta de decir verdad.
                <br />
                <br />
                <br />
                <br />
                <br />
          </td>
        </tr>
        <tr>
          <td colspan="4" class="center">_________________________<br>FIRMA DE CAPTURA</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td colspan="4" class="center">_________________________<br>FIRMA DEL SOLICITANTE</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </table>
    </fieldset>
    </body>
    `;
  
    let footer = fs.readFileSync(path.join(__dirname,"..","/PDF/footer.html"));
  
    fs.writeFileSync(path.join(__dirname,"..","/PDF/credencial.html"),"");
    fs.appendFileSync(path.join(__dirname,"..","/PDF/credencial.html"),header);
    fs.appendFileSync(path.join(__dirname,"..","/PDF/credencial.html"),content);
    fs.appendFileSync(path.join(__dirname,"..","/PDF/credencial.html"),footer);
    res.status(200).sendFile(path.join(__dirname,"..","/PDF/credencial.html"));
  };
  
async function Print(req, res, CURP) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    console.log("PageError:", err)
  });
  await page.setViewport({
    width: 1000,
    height: 1300,
    deviceScaleFactor: 1,
  });
  let pdfruta = APIHOST + "/candidatos/pdf/" + CURP;
  console.log(pdfruta)
  const npage = await page.goto(pdfruta, { waitUntil: "domcontentloaded", });
  const status = npage.status();
  
  if (status == 404) {
    return res.status(404).send("Alumno no encontrado!");
  }
  
  if (status == 403) {
    return res.status(403).send("Datos del alumno incompletos!");
  }
  
  const imgs = await page.$$eval('.imagen img', images => images.map(i => i.src))
  if (imgs.length == 0) {
    return res.status(500).send("Error desconocido, comuniquese con el administrador!");
  }

  const PNGPATH = path.join(__dirname, '..' + "/PNGS/" + CURP + ".png");
  console.log(PNGPATH);
  await page.screenshot({ path: PNGPATH });
  const PDFPATH = path.join(__dirname, '..' + "/PDFS/" + CURP + ".pdf");
  console.log(PDFPATH)
  const pdf = await page.pdf({ format: 'letter', path: PDFPATH });
  //pdf.save(PDFPATH);
    await browser.close();

    return PDFPATH;
  };

module.exports={
  Inscripcion,
  Acuerdo,
  Print,
  create,
  readAll,
  read1,
  update,
  del
}