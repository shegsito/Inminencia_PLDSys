const pool = require('../config/db');

//count how many
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM reporte_interno');
    return rows[0].total;
};

//fetch records
exports.fetchAll = async () => {
    const sql = `
        SELECT idreporteint, descripcion, estatus, fecha, ruta_evidencia
        FROM reporte_interno
    `;
    const { rows } = await pool.query(sql);
    return rows;
};
