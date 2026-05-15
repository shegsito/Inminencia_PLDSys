
const pool = require('../config/db');

//queries for alertas table
exports.countAlertas = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM alerta');
    return rows[0].total;
};

//fetch records
exports.fetchAllAlertas = async () => {
    const sql = `
        SELECT motivo, prioridad
        FROM alerta
        WHERE prioridad IN ('Alta')
    `;
    const { rows } = await pool.query(sql);
    return rows;
};


//queries for clientes table
exports.countClientes = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM cliente');
    return rows[0].total;
};

//fetch records
exports.fetchAllClientes = async () => {
    const sql = `
        SELECT nombre_cliente, nivel_riesgo
        FROM cliente
    `;
    const { rows } = await pool.query(sql);
    return rows;
};



//queries for operaciones table
exports.countOperaciones = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM operacion');
    return rows[0].total;
};

//fetch records
exports.fetchAllOperaciones = async () => {
    const sql = `
        SELECT c.nombre_cliente, op.tipo_operacion, op.monto, op.fecha
        FROM operacion op
        JOIN cliente c ON c.idcliente = op.idcliente
        ORDER BY op.fecha DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};