const pool = require('../config/db');

//count how many
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM reporte_regulatorio');
    return rows[0].total;
};

//fetch records
exports.fetchAll = async () => {
    const sql = `
    SELECT 
        idreporter AS idreporte,
        tipo_reporte AS descripcion,
        idgeneradopor AS reportado_por,
        generado_en AS fecha,
        estatus,
        ruta_archivo AS ruta_evidencia,
        idautorizadopor,
        formato,
        acuse_recibo,
        enviado_en
    FROM reporte_regulatorio
    ORDER BY generado_en DESC
`;
    const { rows } = await pool.query(sql);
    return rows;
};
