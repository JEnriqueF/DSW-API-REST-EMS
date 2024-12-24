const { poolPromise, sql } = require('../db');

const validarPacientePorCURP = async (req, res) => {
    const { CURP } = req.params; 

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CURP', sql.VARCHAR, CURP)
            .output('mensaje', sql.NVarChar)
            .execute('ValidarPacientePorCURP');

        const mensaje = result.output.mensaje;

        if (mensaje.includes('Error')) {
            return res.status(500).json({ error: mensaje });
        }

        return res.status(200).json({
            mensaje: 'Paciente validado correctamente.',
        });
    } catch (err) {
        console.error('Error al validar el paciente:', err);
        return res.status(500).json({ error: 'Error al validar el paciente', detalle: err.message });
    }
};

module.exports = {
    validarPacientePorCURP,
};
