const { poolPromise, sql } = require('../db');

const obtenerConsultasMedicasPorCURP = async (req, res) => {
    const { CURP, pagina = 1, tamanioPagina = 5 } = req.body;

    if (!CURP) {
        return res.status(400).json({ mensaje: 'CURP es obligatorio' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CURP', sql.NVarChar, CURP)
            .input('pagina', sql.Int, pagina)
            .input('tamanioPagina', sql.Int, tamanioPagina)
            .output('mensaje', sql.NVarChar(100))
            .execute('ObtenerConsultasMedicasPorCURP');

        const consultas = result.recordset;
        const mensaje = result.output.mensaje;

        if (!mensaje) {
            return res.status(500).json({
                mensaje: 'Error inesperado: no se pudo recuperar el mensaje del procedimiento almacenado.',
            });
        }

        if (mensaje !== 'Consultas médicas recuperadas correctamente.') {
            return res.status(404).json({ mensaje });
        }

        res.status(200).json(consultas);
    } catch (err) {
        console.error('Error al obtener las consultas médicas:', err);
        res.status(500).json({ error: 'Error al obtener las consultas médicas', detalle: err.message });
    }
};

const obtenerTotalConsultasPorCURP = async (req, res) => {
    const { CURP } = req.body;

    if (!CURP) {
        return res.status(400).json({ mensaje: 'CURP es obligatorio' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CURP', sql.NVarChar, CURP)
            .output('mensaje', sql.NVarChar(100))
            .execute('ObtenerTotalConsultasPorCURP');

        const totalConsultas = result.recordset[0].TotalConsultas;
        const mensaje = result.output.mensaje;

        if (!mensaje) {
            return res.status(500).json({
                mensaje: 'Error inesperado: no se pudo recuperar el mensaje del procedimiento almacenado.',
            });
        }

        if (mensaje !== 'Total de consultas recuperado correctamente.') {
            return res.status(404).json({ mensaje });
        }

        res.status(200).json({ totalConsultas });
    } catch (err) {
        console.error('Error al obtener el total de consultas médicas:', err);
        res.status(500).json({ error: 'Error al obtener el total de consultas médicas', detalle: err.message });
    }
};

const insertarConsultaMedica = async (req, res) => {
    const { diagnostico, tratamiento, fechaConsulta, idPaciente, idPersonalMedico } = req.body;
    let transaction;

    try {
        const pool = await poolPromise;
        transaction = pool.transaction();
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
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Error al insertar la consulta médica:', err);
        res.status(500).json({ error: 'Error al insertar la consulta médica', detalle: err.message });
    }
};

const insertarArchivoConsulta = async (req, res) => {
    const { idConsultaMedica } = req.body;  
    const archivo = req.file; 

    if (!archivo) {
        return res.status(400).json({
            mensaje: 'No se ha recibido ningún archivo.',
        });
    }

    const pool = await poolPromise;
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        const archivoBuffer = archivo.buffer;

        const result = await transaction.request()
            .input('archivo', sql.VarBinary(sql.MAX), archivoBuffer)
            .input('idConsultaMedica', sql.Int, idConsultaMedica)
            .output('mensaje', sql.NVarChar)
            .execute('InsertarArchivoConsulta');

        const mensaje = result.output.mensaje;

        if (mensaje.includes('Error')) {
            await transaction.rollback();
            return res.status(400).json({
                mensaje: 'Error al insertar archivo',
                detalle: mensaje,
            });
        }

        await transaction.commit();

        res.status(200).json({
            mensaje: 'Archivo subido correctamente',
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

const verificarArchivoEnConsulta = async (req, res) => {
    const { idConsultaMedica } = req.body;

    if (!idConsultaMedica) {
        return res.status(400).json({ mensaje: 'El idConsultaMedica es obligatorio' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('idConsultaMedica', sql.Int, idConsultaMedica)
            .query(`
                SELECT COUNT(*) AS ArchivoExiste
                FROM ArchivosConsulta
                WHERE idConsultaMedica = @idConsultaMedica
            `);

        const archivoExiste = result.recordset[0].ArchivoExiste > 0;

        res.status(200).json({
            idConsultaMedica,
            archivoAsociado: archivoExiste,
            mensaje: archivoExiste
                ? 'El archivo está asociado a la consulta médica.'
                : 'No hay archivo asociado a la consulta médica.',
        });
    } catch (err) {
        console.error('Error al verificar archivo en consulta médica:', err);
        res.status(500).json({ 
            error: 'Error al verificar archivo en consulta médica', 
            detalle: err.message 
        });
    }
};

const obtenerArchivoConsulta = async (req, res) => {
    const { idConsultaMedica } = req.params; 

    if (!idConsultaMedica) {
        return res.status(400).json({ mensaje: 'El idConsultaMedica es obligatorio' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('idConsultaMedica', sql.Int, idConsultaMedica)
            .query(`
                SELECT archivo
                FROM ArchivosConsulta
                WHERE idConsultaMedica = @idConsultaMedica
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró el archivo asociado a la consulta médica.' });
        }

        const archivo = result.recordset[0].archivo;

        res.setHeader('Content-Type', 'application/pdf'); 
        res.setHeader('Content-Disposition', 'attachment; filename=archivo_consulta.pdf'); 

        res.status(200).send(archivo);
    } catch (err) {
        console.error('Error al obtener archivo de consulta médica:', err);
        res.status(500).json({
            error: 'Error al obtener archivo de consulta médica',
            detalle: err.message
        });
    }
};

module.exports = { 
    obtenerConsultasMedicasPorCURP, obtenerTotalConsultasPorCURP, 
    insertarConsultaMedica, insertarArchivoConsulta, verificarArchivoEnConsulta,
    obtenerArchivoConsulta 
};