const pool = require('../config/db');

//count how many
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM contrato');
    return rows[0].total;
};

//fetch records
exports.fetchAll = async () => {
    const sql = `
        SELECT 
            co.idcontrato, -- AGREGADO: Necesario para el botón de perfil transaccional
            TRIM(CONCAT(c.nombre, ' ', c.apellido_paterno,
            CASE WHEN c.apellido_materno IS NOT NULL AND c.apellido_materno <> ''
                THEN ' ' || c.apellido_materno ELSE '' END)) AS nombre_cliente,
            co.tipo_producto, co.monto, co.estatus
        FROM contrato co
        JOIN cliente c ON c.idcliente = co.idcliente
        ORDER BY c.created_at DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//fetch clients only
exports.fetchAllClients = async () => {
    const sql = `
        SELECT TRIM(CONCAT(nombre, ' ', apellido_paterno,
            CASE WHEN apellido_materno IS NOT NULL AND apellido_materno <> ''
                THEN ' ' || apellido_materno ELSE '' END)) AS nombre_cliente, idcliente
        FROM cliente
        ORDER BY nombre_cliente ASC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//configure search bar
exports.findByNameOrFolio = async (input) => {
    const name = `%${input}%`;
    const sql = `
        SELECT 
            co.idcontrato, -- AGREGADO AQUÍ TAMBIÉN
            TRIM(CONCAT(c.nombre, ' ', c.apellido_paterno,
                     CASE WHEN c.apellido_materno IS NOT NULL AND c.apellido_materno <> ''
                          THEN ' ' || c.apellido_materno ELSE '' END)) AS nombre_cliente,
            co.tipo_producto, co.monto, co.estatus
        FROM contrato co
        JOIN cliente c ON c.idcliente = co.idcliente
        WHERE c.nombre ILIKE $1 OR c.apellido_paterno ILIKE $1 OR co.idcontrato::text ILIKE $1
        ORDER BY c.created_at DESC
    `;
    const res = await pool.query(sql, [name]);
    return res.rows; 
};

//new contrato and inserting action into bitacora
exports.createContrato = async (idcliente, tipo, fecha_init, fecha_fin, monto, estatus, idusuario, ipOrigin) => {
    const dbClient = await pool.connect();
    try {
        //tracked transaction
        await dbClient.query('BEGIN');

        //contract register
        const sql = `INSERT INTO contrato (idcliente, tipo_producto, fecha_inicio, fecha_fin, monto, estatus)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`;

        const res = await dbClient.query(sql, [idcliente, tipo, fecha_init, fecha_fin, monto, estatus]);
        const contrato = res.rows[0];

        //extract contract identifier
        const idcontrato = contrato.idcontrato;

        //audit log register
        const bitacora = `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`;

        await dbClient.query(bitacora, [idusuario, 'Creó contrato', 'contrato', idcontrato, ipOrigin]);

        //DB change if all succeeds
        await dbClient.query('COMMIT');

        return contrato;

    } catch(e) {
        //any failures do not affect DB
        await dbClient.query('ROLLBACK');
        console.error('Error al crear contrato:', e);
        throw e;
    } finally {
        dbClient.release();
    }
};