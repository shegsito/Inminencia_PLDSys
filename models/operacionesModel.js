
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

exports.findContrato = async (product) => {
    const sql = `SELECT idcontrato 
                 FROM contrato
                 WHERE tipo_producto ILIKE $1`
                 ;
    const res = await pool.query(sql, [product]);
    return res.rows [0];
};

exports.createOperacion = async (idcliente, idcontrato, tipo, monto, idusuario) => {
    const sql = `INSERT INTO operacion (idcliente, idcontrato, tipo_operacion, monto, idregistradapor, fecha)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 RETURNING *`
                 ;
    const res = await pool.query(sql, [idcliente, idcontrato, tipo, monto, idusuario]);
    return res.rows [0];
};