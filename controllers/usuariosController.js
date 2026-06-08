const UsuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');

module.exports.render_login = async (req, res) =>{
    res.render("usuarios/login", { error: null });
}

module.exports.do_login = async (req, res) =>{
        try {
        const { email, password } = req.body;

        //fields must be filled in
        if (!email || !password) {
            return res.render('usuarios/login', { error: 'Por favor completa todos los campos' });
        }

        const usuario = await UsuarioModel.findByEmail(req.body.email);
        //checking for existing user
        console.log("Usuario found:", usuario);

        if (!usuario) {
            return res.render('usuarios/login', { error: 'Usuario o contraseña incorrectos' });
        }

        //verify password
        const doMatch = await bcrypt.compare(password, usuario.password);
        if (!doMatch) {
            return res.render('usuarios/login', { error: 'Usuario o contraseña incorrectos' });
        }

        //load user permissions
        req.session.email = usuario.email;
        req.session.rol = usuario.rol;
        req.session.isLoggedIn = true;
        req.session.permisos = usuario.permisos;
        req.session.idusuario = usuario.idusuario;

        //redirection based on role
        switch (usuario.rol) {
            case 'admin':
                return res.redirect('/oficial/dashboard');

            case 'oficial':
                return res.redirect ('/oficial/dashboard');

            case 'operador':
                return res.redirect ('/operador/dashboard');

            case 'cliente':
                return res.redirect('/cliente');
        }

    } catch (e) {
        console.error(e);
        res.render('usuarios/login', { error: 'Error interno, intenta de nuevo' });
    }
};

//option to end session
exports.logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error al cerrar sesión");
        }

        //delete cookie
        res.clearCookie('connect.sid');
        res.redirect('/usuarios/login');
    });
}

