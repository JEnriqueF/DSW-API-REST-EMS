const { poolPromise, sql } = require('../db');

const obtenerContactos = async (req, res) => {
    const { idPaciente } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('idPaciente', idPaciente)
            .execute('ObtenerContactosEmergenciaPorPaciente');

        res.json(result.recordset);
    } catch (err) {
        console.error('Error ejecutando el procedimiento almacenado:', err);
        res.status(500).json({ error: 'Error al obtener los contactos de emergencia' });
    }
};

const insertarContacto = async (req, res) => {
    const { contactoEmergencia, telefonoContacto1, parentesco, esTutor, idPaciente, esRegistroPaciente } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('contactoEmergencia', contactoEmergencia)
            .input('telefonoContacto1', telefonoContacto1)
            .input('parentesco', parentesco)
            .input('esTutor', esTutor)
            .input('idPaciente', idPaciente)
            .input('esRegistroPaciente', esRegistroPaciente)
            .output('mensaje', sql.NVarChar)
            .execute('InsertarContactoEmergencia');

        // Extraer el mensaje devuelto
        const mensaje = result.output.mensaje;

        res.status(200).json({ mensaje });
    } catch (err) {
        console.error('Error al insertar el contacto de emergencia:', err);
        res.status(500).json({ error: 'Error al insertar el contacto de emergencia' });
    }
};

const actualizarContacto = async (req, res) => {
    const { idPaciente, idInformacionEmergencia, telefonoContacto1, parentesco, esTutor } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('idPaciente', idPaciente)
            .input('idInformacionEmergencia', idInformacionEmergencia)
            .input('telefonoContacto1', telefonoContacto1)
            .input('parentesco', parentesco)
            .input('esTutor', esTutor)
            .output('resultado', sql.Bit) // Especificar tipo de salida
            .output('mensaje', sql.NVarChar)  // Especificar tipo de salida
            .execute('ActualizarContactoEmergencia'); // Ejecutar procedimiento almacenado

        // Obtener valores de salida
        const resultado = result.output.resultado;
        const mensaje = result.output.mensaje;

        res.status(200).json({ resultado: resultado, mensaje: mensaje }); // Enviar respuesta
    } catch (err) {
        console.error('Error al actualizar el contacto de emergencia:', err);
        res.status(500).json({ error: 'Error al actualizar el contacto de emergencia' });
    }
};

const eliminarContacto = async (req, res) => {
    const { idInformacionEmergencia } = req.params; // Extraer el ID de los parámetros

    if (!idInformacionEmergencia) {
        return res.status(400).json({ error: 'El ID del contacto de emergencia es obligatorio' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('idInformacionEmergencia', idInformacionEmergencia)
            .output('resultado', sql.Bit) // Especificar tipo de salida
            .output('mensaje', sql.NVarChar)  // Especificar tipo de salida
            .execute('EliminarContactoEmergencia'); // Ejecutar el procedimiento almacenado

        // Obtener valores de salida
        const resultado = result.output.resultado;
        const mensaje = result.output.mensaje;

        res.status(200).json({ resultado, mensaje }); // Enviar respuesta
    } catch (err) {
        console.error('Error al eliminar el contacto de emergencia:', err);
        res.status(500).json({ error: 'Error al eliminar el contacto de emergencia' });
    }
};

module.exports = { obtenerContactos, insertarContacto, actualizarContacto, eliminarContacto };
