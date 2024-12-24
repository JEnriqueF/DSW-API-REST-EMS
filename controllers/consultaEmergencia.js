const { poolPromise, sql } = require('../db');

const obtenerConsultaEmergencia = async (req, res) => {
    try {
        let CURP = req.params.CURP;

        if (!CURP) {
            return res.status(400).json({
                error: 'La CURP es un parámetro requerido.'
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('CURP', sql.NVarChar, CURP)
            .output('mensaje', sql.NVarChar)
            .execute('ObtenerUltimaConsultaEmergenciaPorCURP');

        const mensaje = result.output.mensaje;

        if (mensaje.includes('CURP no encontrada')) {
            return res.status(404).json({
                mensaje: 'No se encontraron consultas de emergencia para la CURP proporcionada.'
            });
        }

        if (result.recordset && result.recordset.length > 0) {
            return res.status(200).json({
                mensaje: 'Consulta de emergencia obtenida correctamente',
                consultaEmergencia: result.recordset[0],
            });
        } else {
            return res.status(404).json({
                mensaje: 'No se encontraron consultas de emergencia para la CURP proporcionada.'
            });
        }

    } catch (err) {
        console.error('Error al recuperar consulta de emergencia:', err);
        return res.status(500).json({
            error: 'Error al recuperar la consulta de emergencia',
            detalle: err.message
        });
    }
};

module.exports = {
    obtenerConsultaEmergencia,
};
