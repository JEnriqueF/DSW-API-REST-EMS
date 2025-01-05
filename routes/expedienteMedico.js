const express = require('express');
const router = express.Router();
const { corregirExpedienteMedico, recuperarExpediente, modificarExpediente } = require('../controllers/expedienteMedico');
const { verificarToken } = require('../middlewares/auth');

router.put('/corregirExpedienteMedico/:CURP', verificarToken, corregirExpedienteMedico);
router.post('/recuperar', recuperarExpediente);
router.put('/modificar', modificarExpediente);

module.exports = router;