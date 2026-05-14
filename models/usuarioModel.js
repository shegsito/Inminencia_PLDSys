const pool = require('../config/db');

const UsuarioModel = {
    // Create a new user record inside an open transaction
    crear: async (client, { idusuario, nombre, email, password, rol }) => {
        const query = `
            INSERT INTO usuario (idusuario, nombre, email, password_hash, rol, activo, created_at)
            VALUES ($1, $2, $3, $4, $5, true, NOW())
            RETURNING idusuario
        `;
        const res = await client.query(query, [idusuario, nombre, email, password, rol]);
        return res.rows[0];
    },

    // Find an active user by email (used for login)
    // Aliases password_hash → password so the controller can use usuario.password directly
    findByEmail: async (email) => {
        const query = `
            SELECT idusuario, nombre, email, password_hash AS password, rol, activo
            FROM usuario
            WHERE email = $1 AND activo = true
        `;
        const res = await pool.query(query, [email]);
        return res.rows[0] || null;
    },
};

module.exports = UsuarioModel;
