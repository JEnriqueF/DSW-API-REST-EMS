const { poolPromise, sql } = require('../db');

const crearMedico = async (req, res) => {
    const { CURP, cedulaProfesional, contrasena, tipoPersonal, hospitalTrabajo } = req.body;

    if (!cedulaProfesional || !contrasena || !tipoPersonal || !hospitalTrabajo) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios para registrar al personal médico.',
        });
    }

    const tiposPermitidos = ["Médico", "Emergencia"];
    if (!tiposPermitidos.includes(tipoPersonal)) {
        return res.status(400).json({
            error: `El tipo de personal debe ser uno de los siguientes: ${tiposPermitidos.join(", ")}.`,
        });
    }

    try {
        const pool = await poolPromise;

        const resultUsuario = await pool.request()
            .input('CURP', sql.NVarChar(20), CURP)
            .output('mensaje', sql.NVarChar(100))
            .execute('ObtenerPersonaPorCURP');

        const mensajeUsuario = resultUsuario.output.mensaje;
        const datosUsuario = resultUsuario.recordset;

        if (!datosUsuario || datosUsuario.length === 0) {
            return res.status(404).json({
                error: 'CURP no encontrada. No se puede registrar al personal médico.',
                detalle: mensajeUsuario,
            });
        }

        const idUsuario = datosUsuario[0].idUsuario;

        const resultVerificar = await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .query('SELECT COUNT(*) AS conteo FROM PersonalMedico WHERE idUsuario = @idUsuario');

        const conteo = resultVerificar.recordset[0].conteo;
        if (conteo > 0) {
            return res.status(400).json({
                error: 'El usuario ya tiene un perfil médico asociado. No se puede crear otro perfil.',
            });
        }

        const resultMedico = await pool.request()
            .input('cedulaProfesional', sql.NVarChar(45), cedulaProfesional)
            .input('contrasena', sql.NVarChar(sql.MAX), contrasena)
            .input('tipoPersonal', sql.NVarChar(20), tipoPersonal)
            .input('idUsuario', sql.Int, idUsuario)
            .input('hospitalTrabajo', sql.Int, hospitalTrabajo)
            .output('idPersonalMedico', sql.Int)
            .output('mensaje', sql.NVarChar(200))
            .execute('InsertarPersonalMedico');

        const mensajeMedico = resultMedico.output.mensaje;
        const idPersonalMedico = resultMedico.output.idPersonalMedico;

        if (idPersonalMedico === 0) {
            return res.status(500).json({
                error: 'No se pudo registrar al personal médico.',
                detalle: mensajeMedico,
            });
        }

        return res.status(201).json({
            message: 'Personal médico registrado exitosamente.',
            idPersonalMedico,
            detalle: mensajeMedico,
        });
    } catch (err) {
        console.error('Error al registrar personal médico:', err.message);
        return res.status(500).json({
            error: 'Error interno del servidor.',
            detalle: err.message,
        });
    }
};

module.exports = {
    crearMedico,
};
