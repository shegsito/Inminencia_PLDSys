const pool = require('../config/db');
const { fetchAllAlertas } = require('./dashboardModel');

const AlertaModel = {
    fetchAllAlertas: async () => {
        const sql = `
            SELECT a.regla_rota AS tipo,
                        TRIM(CONCAT(c.nombre, ' ', c.apellido_paterno,
                            CASE WHEN c.apellido_materno IS NOT NULL AND c.apellido_materno <> ''
                                THEN ' ' || c.apellido_materno ELSE '' END)) AS nombre_cliente,
                        a.motivo,
                        a.generada_en,
                        a.prioridad,
                        a.estatus FROM alerta a
            JOIN cliente c ON a.idcliente = c.idcliente
            ORDER BY a.generada_en DESC`;
            
        const { rows } = await pool.query(sql);
        return rows;
                }
};

module.exports = AlertaModel;
