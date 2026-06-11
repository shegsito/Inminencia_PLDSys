const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../../config/db');
const UsuarioModel = require('../../models/usuarioModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.gestionar = async (_req, res) => {
    try{
        const usuarios = await UsuarioModel.getAll();
        res.render('admin/gestionar', { pageTitle: 'Gestionar usuarios', pageIcon: 'users-round', usuarios});
    } catch(e) {
        console.error('Error al obtener usuarios:', e);
        res.status(500).send('Error al obtener usuarios');
    }
};

// PATCH /admin/usuarios/:id/activo
exports.toggleActivo = async (req, res) => {
    const { id } = req.params;
    const adminId = req.usuario.id;

    // admin cannot deactivate themselves
    if (id === adminId) {
        return res.status(403).json({ error: 'No puedes desactivarte a ti mismo' });
    }

    try {
        const { rows } = await pool.query(
            'SELECT activo, rol FROM usuario WHERE idusuario = $1', [id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
        if (rows[0].rol === 'admin') {
            return res.status(403).json({ error: 'No se puede desactivar a otro administrador' });
        }

        const nuevoEstado = !rows[0].activo;
        await UsuarioModel.toggleActivo(id, nuevoEstado);

        const accion = nuevoEstado ? 'Activó usuario' : 'Desactivó usuario';
        await pool.query(
            `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [adminId, accion, 'usuario', id, req.ip]
        );

        res.json({ ok: true, activo: nuevoEstado });
    } catch (e) {
        console.error('Error al cambiar estado de usuario:', e);
        res.status(500).json({ error: 'Error interno' });
    }
};

// POST /admin/usuarios
exports.crearUsuario = async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    const adminId = req.usuario.id;

    if (!nombre?.trim())                     return res.status(400).json({ error: 'Nombre requerido' });
    if (!email?.trim() || !EMAIL_REGEX.test(email)) return res.status(400).json({ error: 'Email inválido' });
    if (!password || password.length < 8)    return res.status(400).json({ error: 'Contraseña mínimo 8 caracteres' });
    if (!rol?.trim() || rol === 'admin')     return res.status(400).json({ error: 'Rol inválido' });

    try {
        const idusuario    = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(password, 10);

        // pool acts as client (same .query() interface, no transaction needed)
        await UsuarioModel.crear(pool, {
            idusuario,
            nombre:   nombre.trim(),
            email:    email.trim().toLowerCase(),
            password: passwordHash,
            rol,
        });

        await pool.query(
            `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [adminId, 'Creó usuario', 'usuario', idusuario, req.ip]
        );

        res.status(201).json({ ok: true });
    } catch (e) {
        console.error('Error al crear usuario:', e);
        res.status(500).json({ error: 'Error interno al crear usuario' });
    }
};
