const pool = require('../config/db');

const ClienteModel = {
    getAll: async () => {
        const res = await pool.query('SELECT * FROM cliente ORDER BY created_at DESC');
        return res.rows;
    },

    getById: async (id) => {
        const res = await pool.query('SELECT * FROM cliente WHERE idcliente = $1', [id]);
        return res.rows[0];
    },

    getContratos: async (id) => {
        const res = await pool.query('SELECT * FROM contrato WHERE idcliente = $1', [id]);
        return res.rows;
    },

    existeRFC: async (rfc) => {
        try {
            const res = await pool.query('SELECT idcliente FROM cliente WHERE rfc = $1', [rfc]);
            return res.rows.length > 0;
        } catch (e) {
            console.error('Error al verificar el RFC', e);
            throw e;
        }
    },

    // remember to check this part, email_institucional may not be mandatory
    crear: async (client, { idcliente, idusuario, nombre_completo, rfc, curp, domicilio, email_personal, email_institucional, telefono, tipo_persona }) => {
        try {
            const query = `
                INSERT INTO cliente
                    (idcliente, idusuario, nombre_cliente, rfc, curp, domicilio,
                    email, email_institucional, telefono, tipo_persona)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING idcliente
            `;
            const res = await client.query(query, [
                idcliente, idusuario, nombre_completo, rfc, curp || null,
                domicilio, email_personal, email_institucional || null, telefono, tipo_persona,
            ]);
            return res.rows[0];
        } catch (e) {
            console.error('Error al crear un nuevo cliente');
            throw e;
        }
    },

    // actualizing the editable rows from a client
    // both functions receive client as first parameter so the pool keeps
    // the same open transaction and passes it to both functions
    actualizarDatos: async (client, idcliente, campos) => {
        const columnas = Object.keys(campos);
        const filas    = Object.values(campos);

        // generate SET clause: col1 = $1, col2 = $2 ...
        // this avoids writing a separate query for each possible combination of edited fields
        const setClause = columnas.map((col, i) => `${col} = $${i + 1}`).join(', ');

        await client.query(
            `UPDATE cliente SET ${setClause} WHERE idcliente = $${columnas.length + 1}`,
            [...filas, idcliente]
        );
    },

    // Register each modified row in modificacion_expediente
    registrarModificacion: async (client, { idexpediente, idusuario, campo, valorAnterior, valorNuevo, justificacion }) => {
        await client.query(
            `INSERT INTO modificacion_expediente
                (idexpediente, idusuario, campo_modif, valor_anterior, valor_nuevo, justificacion)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [idexpediente, idusuario, campo, valorAnterior, valorNuevo, justificacion]
        );
    },
};

module.exports = ClienteModel;
