const express = require('express');
const router = express.Router();
const { iniciarSesion } = require('../controllers/iniciarSesion');

// Ruta para el inicio de sesión
router.post('/iniciarSesion', iniciarSesion);

module.exports = router;
