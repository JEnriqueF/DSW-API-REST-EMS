const { poolPromise, sql } = require('../db');
const { generaToken } = require('../services/jwttoken');
const ClaimTypes = require('../config/claimtypes');
const bcrypt = require('bcrypt'); 
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
        let queryResult;

        if (role === 'admin') {
            queryResult = await pool.request()
                .input('correo', sql.VarChar(100), email)
                .query(`
                    SELECT pm.contrasena 
                    FROM PersonalMedico pm
                    JOIN Persona p ON pm.idUsuario = p.idUsuario
                    WHERE p.correo = @correo
                `);

        } else if (role === 'paciente') {
            queryResult = await pool.request()
                .input('CURP', sql.VarChar(20), email)
                .query('SELECT contrasena, idPaciente FROM Paciente INNER JOIN Persona ON Paciente.idUsuario = Persona.idUsuario WHERE CURP = @CURP');
        } else if (role === 'medico') {
            queryResult = await pool.request()
                .input('cedulaProfesional', sql.VarChar(45), email)
                .query('SELECT contrasena, idPersonalMedico, tipoPersonal FROM PersonalMedico WHERE cedulaProfesional = @cedulaProfesional');
        } else {
            return res.status(400).json({
                error: 'Rol no válido.',
            });
        }

        if (!queryResult.recordset.length) {
            return res.status(401).json({
                error: 'Credenciales incorrectas.',
            });
        }

        const user = queryResult.recordset[0];
        const passwordMatch = await bcrypt.compare(password, user.contrasena);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Credenciales incorrectas.',
            });
        }
        let payload = {};
        if (role === 'admin') {
            payload = { [ClaimTypes.Role]: 'admin', [ClaimTypes.Email]: email };
        } else if (role === 'paciente') {
            payload = {
                [ClaimTypes.Role]: 'paciente',
                [ClaimTypes.Id]: user.idPaciente,
                [ClaimTypes.CodigoVerificacion]: email,
            };
        } else if (role === 'medico') {
            payload = {
                [ClaimTypes.Role]: 'medico',
                [ClaimTypes.Id]: user.idPersonalMedico,
                [ClaimTypes.GivenName]: user.tipoPersonal,
                [ClaimTypes.CodigoVerificacion]: email,
            };
        }
        const token = generaToken(payload, '2h');
        const id = role === 'medico' ? user.idPersonalMedico : role === 'paciente' ? user.idPaciente : '';

        return res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            role,
            token,
            id
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
