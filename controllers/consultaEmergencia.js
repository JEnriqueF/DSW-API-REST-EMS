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

const insertarConsultaEmergencia = async (req, res) => {
    const { diagnosticoEmergencia, tratamientoEmergencia, fechaEmergencia, idPaciente, idPersonalMedico } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!diagnosticoEmergencia || !tratamientoEmergencia || !fechaEmergencia || !idPaciente || !idPersonalMedico) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('diagnosticoEmergencia', sql.NVarChar, diagnosticoEmergencia)
            .input('tratamientoEmergencia', sql.NVarChar, tratamientoEmergencia)
            .input('fechaEmergencia', sql.Date, fechaEmergencia)
            .input('idPaciente', sql.Int, idPaciente)
            .input('idPersonalMedico', sql.Int, idPersonalMedico)
            .output('mensaje', sql.NVarChar) // Especificar tipo de salida
            .execute('InsertarConsultaEmergencia'); // Ejecutar el procedimiento almacenado

        const mensaje = result.output.mensaje; // Obtener el mensaje de salida
        res.status(201).json({ mensaje });
    } catch (err) {
        console.error('Error al insertar la consulta de emergencia:', err);
        res.status(500).json({ error: 'Error al insertar la consulta de emergencia' });
    }
};

module.exports = {
    obtenerConsultaEmergencia,
    insertarConsultaEmergencia
};
