const pool = require ('../config/db');

// function to create a new client

const UsuarioModel = { 
    crear: async (client, { idusuario, nombre, email, password, rol}) => {
        // inserting client basic data 
        const query = `
            INSERT INTO USUARIO (idusuario, nombre, email, password, rol, activo, created_at)
            VALUES ($1, $2, $3, $4, $5, true, NOW())
            RETURNING id_usuarios
        `;

        //  check db values
        const res = await client.query(query, [idusuario, nombre, email, password, rol])
        return res.rows[0]
    }
}
    
module.exports = UsuarioModel;

