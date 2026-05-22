const pool = require('../config/db');

//count how many
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM reporte_interno');
    return rows[0].total;
};

//fetch records for canal interno oficial
exports.fetchAll = async () => {
    const sql = `
        SELECT   idreporteint, 
                 descripcion, 
                 estatus, 
                 fecha, 
                 ruta_evidencia FROM reporte_interno
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//new internal report
exports.reporteInterno = async (queja_desc, evidenica, fecha_int, idasignadoa) => {
    const sql = `INSERT INTO reporte_interno (descripcion, ruta_evidencia, estatus, fecha, idasignadoa, anonimo)
                 VALUES ($1, $2, 'recibido', $3, $4, TRUE)
                 RETURNING *`
                 ;
    const res = await pool.query(sql, [queja_desc, evidenica, fecha_int, idasignadoa]);
    return res.rows [0];
};

//fetch case status for operador
//fetch records
exports.fetchAllOperador = async (userId) => {
    const sql = `
        SELECT ri.idreporteint, ri.estatus, ri.fecha
        FROM reporte_interno ri
        WHERE ri.idasignadoa = $1
        ORDER BY ri.fecha DESC
    `;
    const { rows } = await pool.query(sql, [userId]);
    return rows;
};