const express = require('express');
const router = express.Router();
const { corregirExpedienteMedico } = require('../controllers/expedienteMedico');

//Ruta
router.put('/corregirExpedienteMedico/:CURP', corregirExpedienteMedico);

module.exports = router;
