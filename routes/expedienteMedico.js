const express = require('express');
const router = express.Router();
const { corregirExpedienteMedico, recuperarExpediente, modificarExpediente } = require('../controllers/expedienteMedico');

//Ruta
router.put('/corregirExpedienteMedico/:CURP', corregirExpedienteMedico);
router.get('/recuperar', recuperarExpediente);
router.put('/modificar', modificarExpediente);

module.exports = router;
