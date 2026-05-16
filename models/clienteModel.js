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
    crear: async (client, { idcliente, idusuario, nombre_completo, rfc, curp, domicilio, email_personal, email_institucional, telefono, tipo_persona}) => {
        try {
            const query = `
                INSERT INTO cliente
                    (idcliente, idusuario, nombre_cliente, rfc, curp, domicilio,
                    email, email_institucional, telefono, tipo_persona)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                RETURNING idcliente
        `;

        const res = await client.query(query, [
            idcliente, idusuario, nombre_completo, rfc, curp || null,
            domicilio, email_personal, email_institucional || null, telefono, tipo_persona,
        ]);
        return res.rows[0];
        } catch (e) {
            console.error("Error al crear un nuevo cliente");
            throw (e);
        }
    },
};


// ------------------ RF 04 , 05

// actualizing the editable rows from a client
actualizarDatos: async (client, idcliente, campos) => {
    const columnas = Object.keys(campos);
    const filas = Object.values(campos);

    // generate columns by reading each element and asigning $1, $2 ...
    // this takes the array of column names that the user edited before, removing the need to write a consult for wach case
    const setClause = columnas.map((col, i) => `"${col}" = $${i + 1}`).join(',');

    const query = `
        UPDATE "CLIENTE"
        SET ${setClause}
        WHERE "IDCliente" = $${columnas.length + 1}
    `;

    await client.query(query, [...valores, idcliente]);
};

// Register each modified row in MODIFICACION_EXPEDIENTE

// CHECK THE DB COLUMNS, THEY MAY SEEM TO BE BAD WRITTEN (i was sleepy srry)
registrarModificacion: async (client, { idExpediente, idUsuario, campo, valoranterior, valornuevo, justificacion}) => {
    const query = `
        INSERT into "modificacion_expediente"
            ("IDExpediente", "IDUsuario", "campo_modif",
            "valor_anterior", "valor_nuevo", "justifacion", "fecha")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    await client.query(query[
        idExpediente, idUsuario, campo, valoranterior,
        valornuevo, justificacion
    ]);
}

// both funvtions recieve client as the first parameter, this is because the pool 
// has to open the same transaction and pass it to both functions, so them stay at the same conection

getAll: async() => {
    const res = await pool.query('SELECT from "CLIENTES" ORDER BY "nombre_completo" ');
    return res.rows;
},

module.exports = ClienteModel;
