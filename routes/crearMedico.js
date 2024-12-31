const express = require('express');
const router = express.Router();
const { crearMedico } = require('../controllers/crearMedico');

// Ruta para crear un nuevo personal médico
router.post('/', crearMedico);

module.exports = router;
