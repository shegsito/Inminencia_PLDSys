const pool = require('../config/db');

//fetch records
exports.fetchAll = async () => {
    const sql = `
        SELECT generado_en, formato, estatus, ruta_archivo
        FROM reporte_regulatorio
        ORDER BY generado_en DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};
