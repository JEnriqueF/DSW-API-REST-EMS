const express = require('express');
const router = express.Router();
const { obtenerConsultaEmergencia } = require('../controllers/consultaEmergencia');

//Ruta
router.get('/obtenerConsultaEmergencia/:CURP', obtenerConsultaEmergencia);

module.exports = router;
