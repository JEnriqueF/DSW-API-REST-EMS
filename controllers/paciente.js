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

const verificarValidacionPaciente = async (req, res) => {
    const { idPaciente } = req.params;

    try {
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('idPaciente', sql.Int, idPaciente)
            .query('SELECT validado FROM dbo.Paciente WHERE idPaciente = @idPaciente');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        const validacion = result.recordset[0].validado;

        if (validacion === true) {
            return res.status(200).json({
                mensaje: 'El paciente está validado.'
            });
        } else if (validacion === false) {
            return res.status(200).json({
                mensaje: 'El paciente no está validado.'
            });
        } else {
            return res.status(500).json({ error: 'Estado de validación desconocido' });
        }
    } catch (err) {
        console.error('Error al verificar la validación del paciente:', err);
        return res.status(500).json({ error: 'Error al verificar la validación del paciente', detalle: err.message });
    }
};

module.exports = {
    validarPacientePorCURP, verificarValidacionPaciente
};