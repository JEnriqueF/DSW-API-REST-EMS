const { poolPromise, sql } = require('../db');

const obtenerHospitales = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT idHospital, nombreHospital FROM Hospital');

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error al obtener hospitales:', err.message);
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: err.message,
        });
    }
};

module.exports = {
    obtenerHospitales,
};
