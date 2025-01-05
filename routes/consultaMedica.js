const express = require('express');
const router = express.Router();
const { obtenerConsultasMedicasPorCURP, obtenerTotalConsultasPorCURP, insertarConsultaMedica, insertarArchivoConsulta } = require('../controllers/consultaMedica');
const { verificarToken } = require('../middlewares/auth');

router.post('/recuperarConsultas', verificarToken, obtenerConsultasMedicasPorCURP);
router.post('/totalConsultas', verificarToken, obtenerTotalConsultasPorCURP);
router.post('/insertarConsultaMedica', verificarToken, insertarConsultaMedica);
router.post('/insertarArchivoConsulta', verificarToken,insertarArchivoConsulta);

module.exports = router;