
const pool = require('../config/db');

//count how many operaciones
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM operacion');
    return rows[0].total;
};

//fetch records
exports.fetchAll = async () => {
    const sql = `
        SELECT TRIM(CONCAT(c.nombre, ' ', c.apellido_paterno,
            CASE WHEN c.apellido_materno IS NOT NULL AND c.apellido_materno <> ''
                THEN ' ' || c.apellido_materno ELSE '' END)) AS nombre_cliente,
            op.idoperacion, op.tipo_operacion, op.monto, op.fecha, op.estatus
        FROM operacion op
        JOIN cliente c ON c.idcliente = op.idcliente
        ORDER BY op.fecha DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//configure search bar
exports.findByNameOrFolio = async (input) => {
    const sql = `SELECT TRIM(CONCAT(c.nombre, ' ', c.apellido_paterno,
                     CASE WHEN c.apellido_materno IS NOT NULL AND c.apellido_materno <> ''
                         THEN ' ' || c.apellido_materno ELSE '' END)) AS nombre_cliente,
                     op.idoperacion, op.tipo_operacion, op.monto, op.fecha, op.estatus
                 FROM operacion op
                 JOIN cliente c ON c.idcliente = op.idcliente
                 WHERE CONCAT(c.nombre, ' ', c.apellido_paterno, ' ', COALESCE(c.apellido_materno, '')) ILIKE $1
                    OR op.idoperacion::text ILIKE $1
                 ORDER BY op.fecha DESC`
                 ;
    const { rows } = await pool.query(sql, [`%${input}%`]);
    return rows;
};

//queries for new operation register form
exports.findCliente = async (name) => {
    const sql = `SELECT idcliente
                 FROM cliente
                 WHERE TRIM(CONCAT(nombre, ' ', apellido_paterno, ' ', COALESCE(apellido_materno, ''))) ILIKE $1`
                 ;
    const res = await pool.query(sql, [name]);
    return res.rows [0];
};

exports.findContrato = async (product, idcliente) => {
    const sql = `SELECT idcontrato 
                 FROM contrato
                 WHERE tipo_producto ILIKE $1
                 AND idcliente::text = $2`
                 ;
    const res = await pool.query(sql, [product, idcliente]);
    return res.rows [0];
};

//new operation register inserts into bitacora
exports.createOperacion = async (idcliente, idcontrato, tipo, monto, idusuario, ipOrigin) => {
    const dbClient = await pool.connect();
    try{
        //tracked transaction
        await dbClient.query('BEGIN');

        //operation register
        const sql = `INSERT INTO operacion (idcliente, idcontrato, tipo_operacion, monto, idregistradapor, fecha)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 RETURNING *`
                 ;

        const res = await dbClient.query(sql, [idcliente, idcontrato, tipo, monto, idusuario]);
        const operacion = res.rows [0];

        //extract operation identifier
        const idoperacion = operacion.idoperacion;

        //audit log register
        const bitacora = `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`

        await dbClient.query(bitacora, [idusuario, 'CREAR OPERACION', 'operacion', idoperacion, ipOrigin]);

        //DB change if all succeeds
        await dbClient.query('COMMIT');

        return operacion;

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