const express = require('express');
const router = express.Router();
const { obtenerConsultaEmergencia, insertarConsultaEmergencia } = require('../controllers/consultaEmergencia');

//Ruta
router.get('/obtenerConsultaEmergencia/:CURP', obtenerConsultaEmergencia);
router.post('/insertar', insertarConsultaEmergencia);

module.exports = router;
