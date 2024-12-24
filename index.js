const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas
app.use('/api/contactos', require('./routes/contactos'));
app.use('/api/consultaMedica', require('./routes/consultaMedica'));
app.use('/api/consultaEmergencia', require('./routes/consultaEmergencia'));
app.use('/api/expedienteMedico', require('./routes/expedienteMedico'));
app.use('/api/paciente', require('./routes/paciente'));


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Error al iniciar el servidor:', err);
});
