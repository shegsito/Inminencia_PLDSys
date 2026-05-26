const pool = require('../config/db');

//count how many
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM reporte_interno');
    return rows[0].total;
};

//fetch records for canal interno oficial
exports.fetchAll = async () => {
    const sql = `
        SELECT idreporteint, descripcion, estatus, fecha, ruta_evidencia 
        FROM reporte_interno
        ORDER BY fecha DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//new internal report
exports.reporteInterno = async (queja_desc, evidencia, fecha_int, idasignadoa, idusuario, ipOrigin) => {
    const dbClient = await pool.connect();
    try {
        //tracked transaction
        await dbClient.query('BEGIN');

        //create internal report
        const sql = `INSERT INTO reporte_interno (descripcion, ruta_evidencia, estatus, fecha, idasignadoa, anonimo)
                 VALUES ($1, $2, 'recibido', $3, $4, TRUE)
                 RETURNING *`
                 ;

        const res = await dbClient.query(sql, [queja_desc, evidencia, fecha_int, idasignadoa]);
        const reporte_int = res.rows [0];

        //extract internal report identifier
        const idreporteInterno = reporte_int.idreporteint;

        //audit log register
        const bitacora = `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`

        await dbClient.query(bitacora, [idusuario, 'CREAR REPORTE INTERNO', 'reporte interno', reporte_int, ipOrigin]);

        //DB change if all succeeds
        await dbClient.query('COMMIT');

        return reporte_int;

    } catch(e) {
        //any failures do not affect DB
        await dbClient.query('ROLLBACK');
        console.error('Error en transacción: ', e);
        throw e;
    } finally {
        //evades saturation of DB conneections
        dbClient.release();
    }
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

//evaluate internal report
exports.evaluateRI = async (idreporteint, estatus, resolucion, idusuario, ipOrigin) => {
    const dbClient = await pool.connect();
    try{
        const sql = `UPDATE reporte_interno
                    SET estatus = $1, resolucion = $2
                    WHERE idreporteint = $3
                    RETURNING *`
                    ;

        const { rows } = await pool.query(sql, [estatus, resolucion, idreporteint]);
        const eval = rows;

         //extract internal report identifier
        const idreporteInterno = eval.idreporteint;

        //audit log register
        const bitacora = `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`

        await dbClient.query(bitacora, [idusuario, 'EVALUAR REPORTE INTERNO', 'reporte interno', idreporteInterno, ipOrigin]);

        //DB change if all succeeds
        await dbClient.query('COMMIT');

        return eval;

    } catch(e) {
        //any failures do not affect DB
        await dbClient.query('ROLLBACK');
        console.error('Error en transacción: ', e);
        throw e;
    } finally {
        //evades saturation of DB conneections
        dbClient.release();
    }
};