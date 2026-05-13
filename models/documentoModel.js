
//create a document in the table and choose if a document is vigente

const pool = require('../config/db');

const DocumentoModel = {
    // mark all current documents of the same type in this expediente as no longer current

    marcarNoVigente: async (client, {idexpediente, tipo_doc}) => {
        await client.query(
            `UPDATE documento SET vigente = false
            WHERE idexpediente = $1 AND tipo_doc = $2 AND vigente = true`,
            [idexpediente, tipo_doc]
        );
    },

    // INser a new document record
    crear: async(client, {idexpediente, cargado_por, tipo_doc, ruta_archivo, formato, hash_int}) => {
        const query = `
            INSERT INTO documento
                (idexpediente, cargado_por, tipo_doc, ruta_archivo, formato, hash_int)
            VALUES ($1, $2, $3, $4, truen NOW(), $5, $6)
            RETURNING iddocumento
        `;
        const res = await client.query(query, [idexpediente, cargado_por, tipo_doc, ruta_archivo, formato, hash_int]);
        return res.rows[0];
    },
};

module.exports = DocumentoModel;
