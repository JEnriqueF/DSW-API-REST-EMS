const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }).single('archivo'); 
const router = express.Router();
const { obtenerConsultasMedicasPorCURP, obtenerTotalConsultasPorCURP, insertarConsultaMedica, 
    insertarArchivoConsulta , verificarArchivoEnConsulta , obtenerArchivoConsulta} = require('../controllers/consultaMedica');
const { verificarToken } = require('../middlewares/auth');

router.post('/recuperarConsultas', verificarToken, obtenerConsultasMedicasPorCURP);
router.post('/totalConsultas', verificarToken, obtenerTotalConsultasPorCURP);
router.post('/insertarConsultaMedica', verificarToken, insertarConsultaMedica);
router.post('/insertarArchivoConsulta', verificarToken, upload, insertarArchivoConsulta);
router.post('/verificarArchivo', verificarToken, verificarArchivoEnConsulta);
router.get('/obtenerArchivoConsulta/:idConsultaMedica', verificarToken, obtenerArchivoConsulta);

module.exports = router;