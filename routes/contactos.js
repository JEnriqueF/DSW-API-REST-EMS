const express = require('express');
const router = express.Router();
const { obtenerContactos, insertarContacto, actualizarContacto, eliminarContacto } = require('../controllers/contactos');
const { verificarToken } = require('../middlewares/auth');

router.get('/obtenerContactos/:idPaciente', verificarToken, obtenerContactos);
router.post('/insertarContacto', verificarToken, insertarContacto);
router.put('/actualizarContacto', verificarToken, actualizarContacto);
router.delete('/eliminarContacto/:idInformacionEmergencia', verificarToken, eliminarContacto);

module.exports = router;
