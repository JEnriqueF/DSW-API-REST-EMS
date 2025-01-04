const express = require('express');
const router = express.Router();
const { validarPacientePorCURP } = require('../controllers/paciente');
const { verificarToken } = require('../middlewares/auth');

//Ruta
router.put('/validarPaciente/:CURP', verificarToken, validarPacientePorCURP);

module.exports = router;
