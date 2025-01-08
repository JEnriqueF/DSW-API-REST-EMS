const express = require('express');
const router = express.Router();
const { crearPaciente } = require('../controllers/crearPaciente');
const { verificarToken } = require('../middlewares/auth');

// Ruta para registrar un paciente
router.post('/crearPaciente', crearPaciente);

module.exports = router;
