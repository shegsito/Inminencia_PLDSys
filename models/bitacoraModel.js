const pool = require('../config/db');

const BitacoraModel = {
    getAll: async ({ nombre, accion, entidad, fechaInicio, fechaFin } = {}) => {
        const conditions = [];
        const params = [];

        if (nombre?.trim()) {
            params.push(`%${nombre.trim()}%`);
            conditions.push(`u.nombre ILIKE $${params.length}`);
        }
        if (accion?.trim()) {
            params.push(accion.trim());
            conditions.push(`b.accion = $${params.length}`);
        }
        if (entidad?.trim()) {
            params.push(entidad.trim());
            conditions.push(`b.entidad_afect = $${params.length}`);
        }
        if (fechaInicio?.trim()) {
            params.push(fechaInicio.trim());
            conditions.push(`b.fecha >= $${params.length}::date`);
        }
        if (fechaFin?.trim()) {
            params.push(fechaFin.trim());
            conditions.push(`b.fecha < ($${params.length}::date + INTERVAL '1 day')`);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
            SELECT
                b.fecha,
                COALESCE(u.nombre, '—') AS nombre_usuario,
                b.accion,
                b.entidad_afect,
                b.id_entidad,
                b.ip_origen
            FROM bitacora b
            LEFT JOIN usuario u ON u.idusuario = b.idusuario
            ${where}
            ORDER BY b.fecha DESC
        `;
        const { rows } = await pool.query(sql, params);
        return rows;
    },

    getAcciones: async () => {
        const { rows } = await pool.query(
            `SELECT DISTINCT accion FROM bitacora ORDER BY accion`
        );
        return rows.map(r => r.accion);
    },

    getEntidades: async () => {
        const { rows } = await pool.query(
            `SELECT DISTINCT entidad_afect FROM bitacora WHERE entidad_afect IS NOT NULL ORDER BY entidad_afect`
        );
        return rows.map(r => r.entidad_afect);
    },
};

module.exports = BitacoraModel;
