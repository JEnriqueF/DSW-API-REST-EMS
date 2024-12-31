const express = require('express');
const router = express.Router();
const { obtenerPaciente } = require('../controllers/obtenerPaciente');

// Ruta para obtener un paciente por su CURP
router.get('/porCURP/:CURP', obtenerPaciente);

module.exports = router;
