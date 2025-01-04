const express = require('express');
const router = express.Router();
const { obtenerConsultaEmergencia, insertarConsultaEmergencia } = require('../controllers/consultaEmergencia');
const { verificarToken } = require('../middlewares/auth');

//Ruta
router.get('/obtenerConsultaEmergencia/:CURP', verificarToken, obtenerConsultaEmergencia);
router.post('/insertar', insertarConsultaEmergencia);

module.exports = router;
