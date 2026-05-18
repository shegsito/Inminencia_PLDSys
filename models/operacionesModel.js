
const pool = require('../config/db');

//count how many operaciones
exports.count = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM operacion');
    return rows[0].total;
};

//fetch records
exports.fetchAll = async () => {
    const sql = `
        SELECT c.nombre_cliente, op.idoperacion, op.tipo_operacion, op.monto, op.fecha, op.estatus
        FROM operacion op
        JOIN cliente c ON c.idcliente = op.idcliente
        ORDER BY op.fecha DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//configure search bar
exports.findByNameOrFolio = async (input) => {
    const sql = `SELECT c.nombre_cliente, op.idoperacion, op.tipo_operacion, op.monto, op.fecha, op.estatus
                 FROM operacion op 
                 JOIN cliente c ON c.idcliente = op.idcliente
                 WHERE c.nombre_cliente ILIKE $1 OR op.idoperacion::text ILIKE $1
                 ORDER BY op.fecha DESC`
                 ;
    const { rows } = await pool.query(sql, [`%${input}%`]);
    return rows;
};

//queries for new operation register form
exports.findCliente = async (name) => {
    const sql = `SELECT idcliente 
                 FROM cliente
                 WHERE nombre_cliente ILIKE $1`
                 ;
    const res = await pool.query(sql, [name]);
    return res.rows [0];
};

exports.createOperacion = async (idcliente, tipo, monto) => {
    const sql = `INSERT INTO operacion (idcliente, tipo_operacion, monto, fecha)
                 VALUES ($1, $2, $3, NOW())
                 RETURNING *`
                 ;
    const res = await pool.query(sql, [idcliente, tipo, monto]);
    return res.rows [0];
};