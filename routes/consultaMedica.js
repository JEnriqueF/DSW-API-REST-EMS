const express = require('express');
const router = express.Router();
const { insertarConsultaMedica, insertarArchivoConsulta } = require('../controllers/consultaMedica');
const { verificarToken } = require('../middlewares/auth');

//Rutas
router.post('/insertarConsultaMedica', verificarToken, insertarConsultaMedica);
router.post('/insertarArchivoConsulta', verificarToken,insertarArchivoConsulta);

module.exports = router;
