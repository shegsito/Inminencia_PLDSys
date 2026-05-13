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
    },

    // RFC query from cliente
    existeRFC: async (rfc) => {

        try { 
            const res = await pool.query('SELECT idcliente FROM cliente WHERE rfc = $1', [rfc]);
            return res.rows.length > 0;
        } catch (e) {
            console.error("Error al verificar el RFC", e);
            throw (e);
        }
    },

    // create a new client

    // remember to check this part, email_institucional may not be mandatory
    crear: async (client, { idcliente, IDUsuario, nombre_completo, rfc, curp, domicilio, email_personal, email_institucional, telefono, tipo_persona}) => {
        try {
            const query = `
                INSERT INTO cliente
                    (idcliente, idusuario, nombre_completo, rfc, curp, domicilio,
                    email_personal, email_institucional, telefono, tipo_persona,
                    nivel_riesgo, score_riesgo, estatus, bloqueado, created_at)
                VALUES ($1,$2,$3, $4 , $5,$6,$7,$8,$9,$10), 'sin_evaluar', 0, 'pendiente', false, NOW())
                RETURNING idcliente
        `; // are the values correct?

        const res = await client.query(query, [
            idcliente, IDUsuario, nombre_completo, rfc, curp || null,
            domicilio, email_personal, email_institucional || null, telefono, tipo_persona,
        ]);
        return res.rows[0];
        } catch (e) {
            console.error("Error al crear un nuevo cliente");
            throw (e);
        }
    },
};

module.exports = ClienteModel;
