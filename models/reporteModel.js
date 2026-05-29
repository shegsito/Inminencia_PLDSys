const pool = require('../config/db');

//fetch records
exports.fetchAll = async () => {
    const sql = `
        SELECT idreporter, generado_en, formato, estatus, ruta_archivo
        FROM reporte_regulatorio
        ORDER BY generado_en DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//fetch clients inserted in one day
exports.fetchDailyClients = async () => {
    const sql = `SELECT idcliente, email, created_at, TRIM(CONCAT(nombre, ' ', apellido_paterno,
                     CASE WHEN apellido_materno IS NOT NULL AND apellido_materno <> ''
                         THEN ' ' || apellido_materno ELSE '' END)) AS nombre_cliente
            FROM cliente 
            WHERE created_at >= CURRENT_DATE 
              AND created_at < CURRENT_DATE + INTERVAL '1 day'`
    ;
    const { rows } = await pool.query(sql);
    return rows;
};

//fetch activity from bitacora
exports.fetchDailyActivity = async () => {
    const sql = `SELECT idusuario, accion, entidad_afect, fecha
            FROM bitacora
            WHERE fecha >= CURRENT_DATE 
              AND fecha < CURRENT_DATE + INTERVAL '1 day'`
            ;
    const { rows } = await pool.query(sql);
    return rows; 
};

exports.reporteRegulatorio = async (tipo, formato, ruta_archivo, estatus, generado_en, idusuario, ipOrigin) => {
    const dbClient = await pool.connect();
    try{
        //tracked transaction
        await dbClient.query('BEGIN');

        //insert daily report into DB
        const sql = `INSERT INTO reporte_regulatorio (tipo_reporte, formato, ruta_archivo, estatus, generado_en, idgeneradopor)
            VALUES($1, $2, $3, $4, $5, $6)
            RETURNING *`
            ;

    const res = await dbClient.query(sql, [tipo, formato, ruta_archivo, estatus, generado_en, idusuario]);
    const regReport = res.rows[0];

    //extract daily report identifier
    const idreporter = regReport.idreporter;

    //audit log register
    const bitacora = `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
        VALUES ($1, $2, $3, $4, $5, NOW())`

    await dbClient.query(bitacora, [idusuario, 'GENERAR REPORTE REGULATORIO', 'reporte regulatorio', idreporter, ipOrigin]);

    //DB change if all succeeds
    await dbClient.query('COMMIT');

    return regReport;

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
