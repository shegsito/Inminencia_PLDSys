const pool = require('../config/db');

// nombre_comppleto is a computed alias returned by getALl/ getByID
// so views can display the full name without concatenating manually

const NOMBRE_COMPLETO = `
    TRIM(CONCAT(nombre, ' ', apellido_paterno,
        CASE WHEN apellido_materno IS NOT NULL AND apellido_materno <> ''
            THEN ' ' || apellido_materno ELSE '' END ))
    AS nombre_completo`;

const ClienteModel = {
    getAll: async () => {
        const res = await pool.query(
            `SELECT *, ${NOMBRE_COMPLETO} FROM cliente ORDER BY created_at DESC`
        );
        return res.rows;
    },

    getById: async (id) => {
        const res = await pool.query(
            `SELECT *, ${NOMBRE_COMPLETO} FROM cliente WHERE idcliente = $1`,
            [id]
        );
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

    crear: async (client, {
        idcliente, idusuario, nombre, apellido_paterno, apellido_materno,
        rfc, curp,
        calle, colonia, municipio, estado, cp, pais,
        email_personal, email_institucional, telefono, tipo_persona,
    }) => {
        try{
            const query = `
                INSERT INTO cliente
                    (idcliente, idusuario,
                     nombre, apellido_paterno, apellido_materno,
                     rfc, curp,
                     calle, colonia, municipio, estado, cp, pais,
                     email, email_institucional, telefono, tipo_persona)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING idcliente
            `;

            const res = await client.query(query, [
                idcliente, idusuario, nombre, apellido_paterno, apellido_materno || null,
                rfc, curp || null,
                calle, colonia || null, municipio, estado, cp, pais,
                email_personal, email_institucional || null, telefono, tipo_persona,
            ]);
            return res.rows[0];
        } catch (e) {
            console.error('Error al crear un nuevo cliente');
            throw e;
        }
    },

    // dynamic UPDATE 
    actualizarDatos: async (client, idcliente, campos) => {
        const columnas = Object.keys(campos);
        const filas = Object.values(campos);
        const setClause = columnas.map((col, i) => `${col} = $${i + 1}`).join(' , ');
        await client.query(
            `UPDATE cliente SET ${setClause} WHERE idcliente = $${columnas.length + 1}`,
            [...filas, idcliente]
        );
    },

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
