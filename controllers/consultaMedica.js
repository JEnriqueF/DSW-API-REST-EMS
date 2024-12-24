const { poolPromise, sql } = require('../db');

const insertarConsultaMedica = async (req, res) => {
    const { diagnostico, tratamiento, fechaConsulta, idPaciente, idPersonalMedico } = req.body;

    try {
        const pool = await poolPromise;
        const transaction = pool.transaction();
        await transaction.begin();

        const result = await transaction.request()
            .input('diagnostico', sql.NVarChar, diagnostico)
            .input('tratamiento', sql.NVarChar, tratamiento)
            .input('fechaConsulta', sql.Date, fechaConsulta)
            .input('idPaciente', sql.Int, idPaciente)
            .input('idPersonalMedico', sql.Int, idPersonalMedico)
            .output('idConsultaMedica', sql.Int)
            .execute('InsertarConsultaMedica');

        const idConsultaMedica = result.output.idConsultaMedica;

        await transaction.request()
            .input('tratamiento', sql.NVarChar, tratamiento)
            .input('idPaciente', sql.Int, idPaciente)
            .query(`
                UPDATE Paciente
                SET tratamientoActual = @tratamiento
                WHERE idPaciente = @idPaciente
            `);

        await transaction.commit();

        res.status(200).json({
            mensaje: 'Consulta médica insertada y tratamiento actualizado con éxito',
            idConsultaMedica,
        });
    } catch (err) {
        await transaction.rollback()
        console.error('Error al insertar la consulta médica:', err);
        res.status(500).json({ error: 'Error al insertar la consulta médica', detalle: err.message });
    }
};

const insertarArchivoConsulta = async (req, res) => {
    const { archivo, idConsultaMedica } = req.body;

    const pool = await poolPromise;
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        const archivoBuffer = Buffer.from(archivo, 'base64'); 

        const result = await transaction.request()
            .input('archivo', sql.VarBinary(sql.MAX), archivoBuffer) 
            .input('idConsultaMedica', sql.Int, idConsultaMedica)
            .output('mensaje', sql.NVarChar)
            .execute('InsertarArchivoConsulta');

        const mensaje = result.output.mensaje;

        if (mensaje.includes('Error')) {
            await transaction.rollback();

            await transaction.request()
                .input('idConsultaMedica', sql.Int, idConsultaMedica)
                .query('DELETE FROM ConsultaMedica WHERE idConsultaMedica = @idConsultaMedica');

            return res.status(400).json({
                mensaje: 'Error al insertar archivo',
                detalle: mensaje,
            });
        }

        await transaction.commit();

        res.status(200).json({
            mensaje,
        });
    } catch (err) {
        await transaction.rollback();

        console.error('Error al insertar archivo de consulta médica:', err);
        res.status(500).json({
            error: 'Error al insertar el archivo',
            detalle: err.originalError?.info?.message || err.message,
        });
    }
};


module.exports = { insertarConsultaMedica, insertarArchivoConsulta };
