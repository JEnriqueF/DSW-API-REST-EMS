const express = require('express');
const router = express.Router();
const { obtenerContactos, insertarContacto, actualizarContacto, eliminarContacto } = require('../controllers/contactos');
const { verificarToken } = require('../middlewares/auth');

// Ruta protegida con JWT
//router.get('/:idPaciente', verificarToken, obtenerContactos);
router.get('/obtenerContactos/:idPaciente', obtenerContactos);
router.post('/insertarContacto', insertarContacto);
router.put('/actualizarContacto', actualizarContacto);
router.delete('/eliminarContacto/:idInformacionEmergencia', eliminarContacto);

module.exports = router;
