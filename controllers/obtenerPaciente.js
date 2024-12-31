const { poolPromise, sql } = require('../db');

const obtenerPaciente = async (req, res) => {
    const { CURP } = req.params;

    if (!CURP) {
        return res.status(400).json({
            error: 'El parámetro CURP es obligatorio.',
        });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CURP', sql.NVarChar(20), CURP)
            .output('mensaje', sql.NVarChar(100))
            .execute('ObtenerPersonaPorCURP');

        const mensaje = result.output.mensaje;

        if (mensaje !== 'CURP encontrada.') {
            return res.status(404).json({
                error: mensaje,
            });
        }

        const persona = result.recordset[0];
        return res.status(200).json({
            message: mensaje,
            data: persona,
        });
    } catch (err) {
        console.error('Error al obtener el paciente:', err.message);
        return res.status(500).json({
            error: 'Error interno del servidor.',
            detalle: err.message,
        });
    }
};

module.exports = {
    obtenerPaciente,
};
