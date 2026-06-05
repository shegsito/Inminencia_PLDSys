const pool = require('../config/db');

exports.fetchAllAlertas = async () => {
    const sql = `
        SELECT 
            a.idalerta AS id,
            TRIM(CONCAT(c.nombre, ' ', c.apellido_paterno, ' ', COALESCE(c.apellido_materno, ''))) AS cliente_evaluado,
            a.motivo AS motivo_excepcion,
            a.prioridad,
            a.estatus AS estado
        FROM public.alerta a
        JOIN public.cliente c ON a.idcliente = c.idcliente
        WHERE a.estatus = 'pendiente'
        ORDER BY a.prioridad ASC, a.generada_en DESC
    `;
    const { rows } = await pool.query(sql);
    return rows;
};
