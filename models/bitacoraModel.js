const pool = require('../config/db');

const ACCIONES_POSIBLES = [
    'Activó usuario',
    'Desactivó usuario',
    'Creó usuario',
    'Registró cliente',
    'Subió documento',
    'Consultó evidencia',
    'Descargó reporte regulatorio',
    'Consultó expediente',
    'Actualizó cliente',
    'Generó reporte regulatorio',
    'Creó nueva operación',
    'Generó reporte interno',
    'Evaluó reporte interno',
    'Creó contrato',
    'Evaluó alerta',      
    'Subió lista',       
    'Descargó lista',
    'Actualizó perfil transaccional'
];

const BitacoraModel = {
    getAll: async ({ nombre, accion, entidad, fecha } = {}) => {
        const conditions = [];
        const params = [];

        if (nombre?.trim()) {
            params.push(`%${nombre.trim()}%`);
            conditions.push(`u.nombre ILIKE $${params.length}`);
        }
        if (accion?.trim()) {
            params.push(`${accion.trim()}%`);
            conditions.push(`b.accion ILIKE $${params.length}`);
        }
        if (entidad?.trim()) {
            params.push(entidad.trim());
            conditions.push(`b.entidad_afect = $${params.length}`);
        }
        if (fecha?.trim()) {
            params.push(fecha.trim());
            conditions.push(`b.fecha::date = $${params.length}::date`);
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

    getAcciones: () => ACCIONES_POSIBLES,

    getEntidades: async () => {
        const { rows } = await pool.query(
            `SELECT DISTINCT entidad_afect FROM bitacora WHERE entidad_afect IS NOT NULL ORDER BY entidad_afect`
        );
        return rows.map(r => r.entidad_afect);
    },

    registrarAccion: async ({ idusuario, accion, entidad_afect, id_entidad, ip_origen }) => {
        try {
            const sql = `
                INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen)
                VALUES ($1, $2, $3, $4, $5)
            `;
            const ip = ip_origen ? ip_origen.replace(/^.*:/, '') : null; 

            await pool.query(sql, [idusuario, accion, entidad_afect, id_entidad, ip]);
        } catch (error) {
            console.error('Error al registrar en la bitácora:', error);
        }
    }
};

module.exports = BitacoraModel;
