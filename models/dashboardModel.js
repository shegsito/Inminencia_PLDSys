
const pool = require('../config/db');

//queries for alertas table
exports.countAlertas = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM alerta');
    return rows[0].total;
};

exports.fetchAllAlertas = async () => {
    const sql = `
        SELECT motivo, prioridad, generada_en
        FROM alerta
        WHERE prioridad IN ('alta')
        ORDER BY generada_en DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//queries for clientes table
exports.countClientes = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM cliente');
    return rows[0].total;
};

exports.fetchAllClientes = async () => {
    const sql = `
        SELECT nombre_cliente, nivel_riesgo
        FROM cliente
        ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

//queries for operaciones table
exports.countOperaciones = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM operacion');
    return rows[0].total;
};

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

