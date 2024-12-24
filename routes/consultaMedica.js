const express = require('express');
const router = express.Router();
const { insertarConsultaMedica, insertarArchivoConsulta } = require('../controllers/consultaMedica');

//Rutas
router.post('/insertarConsultaMedica', insertarConsultaMedica);
router.post('/insertarArchivoConsulta', insertarArchivoConsulta);

module.exports = router;
