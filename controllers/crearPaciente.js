const { poolPromise, sql } = require('../db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const validarFormatoCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
const validarFormatoCURP = (curp) => /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/.test(curp);
const validarFormatoTelefono = (telefono) => /^\d{10,12}$/.test(telefono);
const validarFormatoFecha = (fecha) => {
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) return false;
    const fechaObjeto = new Date(fecha);
    return fechaObjeto instanceof Date && !isNaN(fechaObjeto.getTime());
};

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
            error: 'El teléfono debe contener entre 10 y 12 dígitos.',
        });
    }

    if (!validarFormatoCURP(CURP)) {
        return res.status(400).json({
            error: 'El formato del CURP no es válido.',
        });
    }

    if (!validarFormatoFecha(fechaNacimiento)) {
        return res.status(400).json({
            error: 'El formato de la fecha de nacimiento no es válido.',
        });
    }

    try {
        const pool = await poolPromise;

        const correoExistente = await pool.request()
            .input('correo', sql.NVarChar(100), correo)
            .query('SELECT COUNT(*) AS count FROM Persona WHERE correo = @correo');

        if (correoExistente.recordset[0].count > 0) {
            return res.status(400).json({
                error: 'El correo ya está registrado en el sistema.',
            });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);

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

        if (!idUsuario) {
            return res.status(400).json({
                error: mensajePersona || 'Error al insertar la persona.',
            });
        }

        const pacienteResult = await pool.request()
            .input('contrasena', sql.NVarChar(sql.MAX), hashedPassword)
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

        if (!idPaciente) {
            return res.status(400).json({
                error: mensajePaciente || 'Error al insertar el paciente.',
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
