const { poolPromise, sql } = require('../db');
require('dotenv').config();

const validarFormatoCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
const validarFormatoCURP = (curp) => /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/.test(curp);
const validarFormatoTelefono = (telefono) => /^\d{10,12}$/.test(telefono);

const crearPaciente = async (req, res) => {
    const {
        nombre,
        fechaNacimiento,
        sexo,
        correo,
        telefono,
        CURP,
        contrasena,
        alergias,
        enfermedadesCronicas,
        tratamientoActual,
        validado = false,
        hospitalRegistro,
    } = req.body;

    // Validaciones iniciales
    if (
        !nombre ||
        !fechaNacimiento ||
        !sexo ||
        !correo ||
        !telefono ||
        !CURP ||
        !contrasena ||
        !hospitalRegistro
    ) {
        return res.status(400).json({
            error: 'Faltan datos obligatorios para registrar al paciente.',
        });
    }

    if (!['M', 'F'].includes(sexo)) {
        return res.status(400).json({
            error: 'El campo "sexo" debe ser "M" o "F".',
        });
    }

    if (!validarFormatoCorreo(correo)) {
        return res.status(400).json({
            error: 'El formato del correo electrónico no es válido.',
        });
    }

    if (!validarFormatoTelefono(telefono)) {
        return res.status(400).json({
            error: 'El teléfono debe contener entre 10 y 12 dígitos numéricos.',
        });
    }

    if (!validarFormatoCURP(CURP)) {
        return res.status(400).json({
            error: 'El formato del CURP no es válido.',
        });
    }

    if (isNaN(new Date(fechaNacimiento).getTime())) {
        return res.status(400).json({
            error: 'El formato de la fecha de nacimiento no es válido.',
        });
    }

    try {
        const pool = await poolPromise;

        // Verificar si el correo ya existe en la base de datos
        const correoExistente = await pool.request()
            .input('correo', sql.NVarChar(100), correo)
            .query('SELECT COUNT(*) AS count FROM Persona WHERE correo = @correo');

        if (correoExistente.recordset[0].count > 0) {
            return res.status(400).json({
                error: 'El correo ya está registrado en el sistema.',
            });
        }

        // Paso 1: Insertar Persona
        const personaResult = await pool.request()
            .input('nombre', sql.NVarChar(100), nombre)
            .input('fechaNacimiento', sql.Date, fechaNacimiento)
            .input('sexo', sql.Char(1), sexo)
            .input('correo', sql.NVarChar(100), correo)
            .input('telefono', sql.NVarChar(12), telefono)
            .input('CURP', sql.NVarChar(20), CURP)
            .input('fechaRegistro', sql.Date, new Date())
            .output('idUsuario', sql.Int)
            .output('mensaje', sql.NVarChar(200))
            .execute('InsertarPersona');

        const idUsuario = personaResult.output.idUsuario;
        const mensajePersona = personaResult.output.mensaje;

        if (idUsuario === 0) {
            return res.status(400).json({
                error: mensajePersona,
            });
        }

        // Paso 2: Insertar Paciente
        const pacienteResult = await pool.request()
            .input('contrasena', sql.NVarChar(sql.MAX), contrasena)
            .input('alergias', sql.NVarChar(sql.MAX), alergias || '')
            .input('enfermedadesCronicas', sql.NVarChar(sql.MAX), enfermedadesCronicas || '')
            .input('tratamientoActual', sql.NVarChar(sql.MAX), tratamientoActual || '')
            .input('validado', sql.Bit, validado)
            .input('idUsuario', sql.Int, idUsuario)
            .input('hospitalRegistro', sql.Int, hospitalRegistro)
            .output('idPaciente', sql.Int)
            .output('mensaje', sql.NVarChar(200))
            .execute('InsertarPaciente');

        const idPaciente = pacienteResult.output.idPaciente;
        const mensajePaciente = pacienteResult.output.mensaje;

        if (idPaciente === 0) {
            return res.status(400).json({
                error: mensajePaciente,
            });
        }

        return res.status(201).json({
            message: 'Paciente registrado exitosamente.',
            idPaciente,
            idUsuario,
        });
    } catch (err) {
        console.error('Error al registrar paciente:', err.message);
        return res.status(500).json({
            error: 'Error interno del servidor.',
            detalle: err.message,
        });
    }
};

module.exports = {
    crearPaciente,
};
