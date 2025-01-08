const express = require('express');
const router = express.Router();
const { crearMedico } = require('../controllers/crearMedico');
const { verificarToken } = require('../middlewares/auth');

// Ruta para crear un nuevo personal médico
router.post('/', verificarToken, crearMedico);

module.exports = router;
