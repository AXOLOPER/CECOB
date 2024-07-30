const express = require('express');
var md_auth = require('../middleware/authenticated');
const Controller = require("../controllers/alumnos.controller");

const api = express.Router();

    // Ruta de Registro
    api.post("/", md_auth.ensureAuth, Controller.createMany);
    
    // Ruta de Registro
    api.post("/PDF",Controller.sendPDF);

    // Ruta de Consulta inicial
    api.get("/", md_auth.ensureAuth, Controller.readAll);
    
    // Ruta de Consulta particular
    api.get("/disponibles/",md_auth.ensureAuth,Controller.readDisponibles);

    // Ruta de Consulta particular
    api.get("/:id", md_auth.ensureAuth, Controller.read1);
    

    // Ruta de Actualizar
    api.put("/",md_auth.ensureAuth,Controller.update);
  
    // Ruta de Eliminar
    api.delete("/:id", md_auth.ensureAuth, Controller.del);
    
    // Ruta de Inscripcion
    api.post("/CURP/:CURP",Controller.readCURP);

module.exports = api;