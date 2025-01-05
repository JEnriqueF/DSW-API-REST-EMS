const express = require('express');
const router = express.Router();
const { obtenerHospitales } = require('../controllers/hospital');

// Ruta para obtener los hospitales
router.get('/obtenerHospitales', obtenerHospitales);

module.exports = router;
