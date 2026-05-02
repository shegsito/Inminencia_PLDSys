const pool = require('../config/db');

const ClienteModel = {
    getById: async (id) => {
        try {
            const query = 'SELECT * FROM "CLIENTE" WHERE "IDCliente" = $1';
            const res = await pool.query(query, [id]);
            return res.rows[0];
        } catch (e) {
            throw (e);
        };
    },

    getContratos: async (id) => {
        try {
            const query = 'SELECT * FROM "CONTRATO" WHERE "IDCliente" = $1';
            const res = await pool.query(query, [id]);
            return res.rows;
        } catch (e) {
            throw (e);
        };
    },
    
    logAction: async (IDUsuario, action) => {
        try {
            const query = 'INSERT INTO "BITACORA" ("IDUsuario", "accion", "fecha") VALUES ($1, $2, NOW())';
            await pool.query(query, [IDUsuario, action]);
        } catch (e) {
            console.error('Error al registrar la acción en la bitácora:', e);
        }
    }
};

module.exports = ClienteModel;