const pool = require('../config/db');

//count how many
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM contrato');
    return rows[0].total;
};

//fetch records
exports.fetchAll = async () => {
    const sql = `
        SELECT c.nombre_cliente, co.tipo_producto, co.monto, co.estatus
        FROM contrato co
        JOIN cliente c ON c.idcliente = co.idcliente
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//configure search bar
exports.findByNameOrFolio = async (input) => {
    const sql = `SELECT c.nombre_cliente, co.tipo_producto, co.monto, co.estatus
                 FROM contrato co
                 JOIN cliente c ON c.idcliente = co.idcliente
                 WHERE c.nombre_cliente ILIKE $1 OR co.tipo_producto::text ILIKE $1`
                 ;
    const { rows } = await pool.query(sql, [`%${input}%`]);
    return rows;
};

exports.findCliente = async (name) => {
    const sql = `SELECT idcliente 
                 FROM cliente
                 WHERE nombre_cliente ILIKE $1`
                 ;
    const res = await pool.query(sql, [name]);
    return res.rows [0];
};

//creating new contrato and inserting into table query
exports.createContrato = async (idcliente, tipo, fecha_init, fecha_fin, monto, estatus) => {
    const sql = `INSERT INTO contrato (idcliente, tipo_producto, fecha_inicio, fecha_fin, monto, estatus)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`
                 ;
    const res = await pool.query(sql, [idcliente, tipo, fecha_init, fecha_fin, monto, estatus]);
    return res.rows [0];
};