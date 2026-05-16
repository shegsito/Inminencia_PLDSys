const pool = require('../config/db');

const DOCS_REQUERIDOS = {
    fisica: ['ine', 'comprobante_domicilio'],
    moral:  ['ine', 'comprobante_domicilio', 'acta_constitutiva'],
};

const ExpedienteModel = {
    // Create a new expediente linked to a client
    crear: async (client, { idcliente }) => {
        const query = `
            INSERT INTO expediente (idexpediente, idcliente, completo, activo, created_at)
            VALUES (gen_random_uuid(), $1, false, false, NOW())
            RETURNING idexpediente
        `;
        const res = await client.query(query, [idcliente]); // fixed: was [id_cliente]
        return res.rows[0];
    },

    // Fetch an expediente with its client's tipo_persona (needed for completeness check)
    getById: async (idexpediente) => {
        const query = `
            SELECT e.*, c.tipo_persona
            FROM expediente e
            JOIN cliente c ON e.idcliente = c.idcliente
            WHERE e.idexpediente = $1
        `;
        const res = await pool.query(query, [idexpediente]);
        return res.rows[0];
    },

    // Mark expediente as complete if all required docs for its tipo_persona are present
    actualizarCompleto: async (client, { idexpediente, tipo_persona }) => {
        const requeridos = DOCS_REQUERIDOS[tipo_persona] ?? DOCS_REQUERIDOS.fisica;

        const res = await client.query(
            `SELECT ARRAY_AGG(tipo_documento) AS tipos
             FROM documento
             WHERE idexpediente = $1 AND vigente = true`,
            [idexpediente]
        );

        const tiposActuales = res.rows[0]?.tipos ?? [];
        const completo = requeridos.every(t => tiposActuales.includes(t));

        if (completo) {
            await client.query(
                `UPDATE expediente SET completo = true WHERE idexpediente = $1`,
                [idexpediente]
            );
        }

        return completo;
    },
};

// searching for the client (1-1)

getByCliente: async (idCliente) => {
    const query = `
        SELECT * FROM expediente
        WHERE idcliente = $1
    `;

    const res = await pool.query(query, [idCliente]);
    return res.rows[0];
};

// get all active documents from expedients
getDocumentos: async (idExpediente) => {
    const query = `
        SELECT * FROM documento 
        WHERE idexpediente = $1
        ORDER BY fecha_carga DESC
    `;

    const res = await pool.query(query, [idExpediente]);
    return res.rows;

};

module.exports = ExpedienteModel;
