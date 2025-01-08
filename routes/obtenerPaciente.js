const express = require('express');
const router = express.Router();
const { obtenerPaciente } = require('../controllers/obtenerPaciente');
const { verificarToken } = require('../middlewares/auth');

// Ruta para obtener un paciente por su CURP
router.get('/porCURP/:CURP', verificarToken, obtenerPaciente);

module.exports = router;
