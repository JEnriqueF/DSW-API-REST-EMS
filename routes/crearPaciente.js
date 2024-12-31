const express = require('express');
const router = express.Router();
const { crearPaciente } = require('../controllers/crearPaciente');

// Ruta para registrar un paciente
router.post('/crearPaciente', crearPaciente);

module.exports = router;
