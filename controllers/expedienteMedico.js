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

const recuperarExpediente = async (req, res) => {
    const { CURP } = req.body; // Extraer el CURP del cuerpo de la solicitud

    if (!CURP) {
        return res.status(400).json({ error: 'El CURP es obligatorio' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CURP', sql.NVarChar, CURP)
            .output('mensaje', sql.NVarChar) // Especificar tipo de salida
            .execute('RecuperarExpedienteMedico'); // Ejecutar el procedimiento almacenado

        const resultado = result.recordset;
        const mensaje = result.output.mensaje; // Obtener el mensaje de salida
        res.status(200).json({ mensaje, resultado }); // Enviar el mensaje como respuesta
    } catch (err) {
        console.error('Error al recuperar el expediente médico:', err);
        res.status(500).json({ error: 'Error al recuperar el expediente médico' });
    }
};

const modificarExpediente = async (req, res) => {
    const { CURP, alergias, enfermedadesCronicas } = req.body; // Extraer datos del cuerpo de la solicitud

    if (!CURP) {
        return res.status(400).json({ error: 'El CURP es obligatorio' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CURP', sql.NVarChar, CURP)
            .input('alergias', sql.NVarChar, alergias || '')
            .input('enfermedadesCronicas', sql.NVarChar, enfermedadesCronicas || '')
            .output('mensaje', sql.NVarChar) // Especificar tipo de salida
            .execute('ModificarExpedienteMedicoPorCURP'); // Ejecutar el procedimiento almacenado

        const mensaje = result.output.mensaje; // Obtener el mensaje de salida
        res.status(200).json({ mensaje });
    } catch (err) {
        console.error('Error al modificar el expediente médico:', err);
        res.status(500).json({ error: 'Error al modificar el expediente médico' });
    }
};

module.exports = {
    corregirExpedienteMedico,
    recuperarExpediente,
    modificarExpediente
};
