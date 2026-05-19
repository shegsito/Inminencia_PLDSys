const pool = require('../config/db');

exports.findCliente = async (name) => {
    const sql = `SELECT idcliente 
                 FROM cliente
                 WHERE nombre_cliente ILIKE $1`
                 ;
    const res = await pool.query(sql, [name]);
    return res.rows [0];
};

//creating new contrato and inserting into table query
exports.createContrato = async (idcliente, tipo, monto, fecha_init, fecha_fin, estatus) => {
    const sql = `INSERT INTO contrato (idcliente, tipo_producto, monto, fecha_inicio, fecha_fin, estatus)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 RETURNING *`
                 ;
    const res = await pool.query(sql, [idcliente, tipo, monto, fecha_init, fecha_fin, estatus]);
    return res.rows [0];
};