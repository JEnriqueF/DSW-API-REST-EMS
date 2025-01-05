const express = require('express');
const router = express.Router();
const { validarPacientePorCURP, verificarValidacionPaciente } = require('../controllers/paciente');
const { verificarToken } = require('../middlewares/auth');

router.put('/validarPaciente/:CURP', verificarToken, validarPacientePorCURP);
router.get('/verificarValidacion/:idPaciente', verificarToken, verificarValidacionPaciente);

module.exports = router;