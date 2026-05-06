const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.User = class {
    constructor(nombre, email, password, rol) {
        this.nombre = nombre;
        this.email = nombre;
        this.password = password;
        this.rol = rol;
    }

    async save() {
        const hashedPass = await bcrypt.hash(this.password, 12);
        const sql = `INSERT INTO usuario (nombre, email, password_hash, rol, activo)
                     VALUES ($1, $2, $3, $4, TRUE)
                     RETURNING IDUsuario, email, rol`;
        const { rows } = await pool.query(sql, [this.nombre, this.email, hashedPass, this.rol]);
        return rows[0];
    }

    static async findByEmail(email) {
        const sql = `SELECT IDUsuario, nombre, email, password_hash AS password, rol, activo
                     FROM usuario 
                     WHERE email = $1 AND activo = TRUE`;
        const { rows } = await pool.query(sql, [email]);
        return rows[0] || null;
    }

    /*static async getPermisos(email){
        const sql = `SELECT rol FROM usuarios
                     WHERE email = $1`;
        const { rows } = await pool.query(sql, [email]);
        return rows;
    }*/

};