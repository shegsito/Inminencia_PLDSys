
//create a document in the table and choose if a document is vigente

const DocumentoModel = {
    // mark all current documents of the same type in this expediente as no longer current

    marcarNoVigente: async (client, {idexpediente, tipo_documento}) => {
        await client.query(
            `UPDATE documento SET vigente = false
            WHERE idexpediente = $1 AND tipo_documento = $2 AND vigente = true`,
            [idexpediente, tipo_documento]
        );
    },

    // INser a new document record
    crear: async(client, {idexpediente, idcargadopor, tipo_documento, ruta_archivo, formato, hash_integridad}) => {
        const query = `
            INSERT INTO documento
                (idexpediente, idcargadopor, tipo_documento, ruta_archivo, formato, hash_integridad)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING iddocumento
        `;
        const res = await client.query(query, [idexpediente, idcargadopor, tipo_documento, ruta_archivo, formato, hash_integridad]);
        return res.rows[0];
    },
};

module.exports = DocumentoModel;
