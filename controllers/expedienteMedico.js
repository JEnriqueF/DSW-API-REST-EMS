const { poolPromise, sql } = require('../db');

const corregirExpedienteMedico = async (req, res) => {
    const CURP = req.params.CURP; 
    const { alergias, enfermedadesCronicas, tratamientoActual } = req.body; 

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CURP', sql.NVarChar, CURP)
            .input('alergias', sql.NVarChar, alergias)
            .input('enfermedadesCronicas', sql.NVarChar, enfermedadesCronicas)
            .input('tratamientoActual', sql.NVarChar, tratamientoActual)
            .output('mensaje', sql.NVarChar)
            .execute('CorregirExpedienteMedicoPorCURP');

        const mensaje = result.output.mensaje;

        if (mensaje.includes('Error')) {
            return res.status(500).json({ error: mensaje });
        }

        return res.status(200).json({
            mensaje: 'Expediente médico actualizado correctamente.',
            detalles: result.recordset,
        });
    } catch (err) {
        console.error('Error al corregir expediente médico:', err);
        return res.status(500).json({ error: 'Error al corregir expediente médico', detalle: err.message });
    }
};

module.exports = {
    corregirExpedienteMedico,
};
