const pool = require('../config/db');

//count how many
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM reporte_interno');
    return rows[0].total;
};

//fetch records
exports.fetchAll = async (userId) => {
    const sql = `
        SELECT ri.idreporteint, ri.descripcion, ri.estatus, ri.fecha, ri.ruta_evidencia 
        FROM reporte_interno ri
        JOIN usuario u ON u.idusuario = ri.idreporteint
        WHERE u.idusuario = $1
        ORDER BY ri.fecha DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//new internal report
exports.reporteInterno = async (queja_desc, evidencia, fecha_int, idusuario) => {
    const sql = `INSERT INTO reporte_interno (descripcion, ruta_evidencia, estatus, fecha)
                 VALUES ($1, $2, 'recibido', $3)
                 RETURNING *`
                 ;
    const res = await pool.query(sql, [queja_desc, evidencia, fecha_int]);
    const reporteId = res.rows [0];

    const sql2 = `UPDATE usuario
                  SET idreporteint = $1
                  WHERE idusuario = $2
                  `;
    await pool.query(sql2, [reporteId, idusuario]);
    return reporteId;
};

