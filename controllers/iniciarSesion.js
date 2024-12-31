const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../db');
require('dotenv').config();

const iniciarSesion = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            error: 'Faltan credenciales o el rol para iniciar sesión.',
        });
    }

    try {
        const pool = await poolPromise; 

        let result;

        if (role === 'admin') {
            result = await pool.request()
                .input('correo', sql.VarChar(100), email)
                .input('contrasena', sql.NVarChar(sql.MAX), password)
                .output('resultado', sql.Bit)
                .execute('IniciarSesionAdmin');
        } else if (role === 'paciente') {
            result = await pool.request()
                .input('CURP', sql.VarChar(20), email)
                .input('contrasena', sql.NVarChar(sql.MAX), password)
                .output('resultado', sql.Bit)
                .output('idPaciente', sql.Int)
                .execute('IniciarSesionPaciente');
        } else if (role === 'medico') {
            result = await pool.request()
                .input('cedulaProfesional', sql.VarChar(45), email)
                .input('contrasena', sql.NVarChar(sql.MAX), password)
                .output('resultado', sql.Bit)
                .output('tipoPersonal', sql.NVarChar(20))
                .output('idPersonalMedico', sql.Int)
                .execute('IniciarSesionMedico');
        } else {
            return res.status(400).json({
                error: 'Rol no válido.',
            });
        }

        const isAuthenticated = result.output.resultado;

        if (!isAuthenticated) {
            return res.status(401).json({
                error: 'Credenciales incorrectas.',
            });
        }

        //payload del token
        let payload = {};
        if (role === 'admin') {
            payload = { role: 'admin', email };
        } else if (role === 'paciente') {
            payload = { role: 'paciente', idPaciente: result.output.idPaciente, CURP: email };
        } else if (role === 'medico') {
            payload = {
                role: 'medico',
                idPersonalMedico: result.output.idPersonalMedico,
                tipoPersonal: result.output.tipoPersonal,
                cedulaProfesional: email,
            };
        }

        // Firma el token JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

        return res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            role,
        });
    } catch (err) {
        console.error('Error en el inicio de sesión:', err.message);
        return res.status(500).json({
            error: 'Error interno del servidor.',
            detalle: err.message,
        });
    }
};

module.exports = {
    iniciarSesion,
};

