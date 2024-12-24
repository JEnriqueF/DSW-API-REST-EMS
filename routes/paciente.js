const express = require('express');
const router = express.Router();
const { validarPacientePorCURP } = require('../controllers/paciente');

//Ruta
router.put('/validarPaciente/:CURP', validarPacientePorCURP);

module.exports = router;
