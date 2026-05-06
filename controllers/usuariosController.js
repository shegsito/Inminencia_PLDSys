const model = require("../models/usuariosModel.js")
const bcrypt = require('bcrypt');

module.exports.render_login = async (req, res) =>{
    res.render("usuarios/login", { registro: false });
}

module.exports.do_login = async (req, res) =>{
        try {
        const usuario = await model.User.findByEmail(req.body.email);
        //checking for existing user
        if (!email) {
            return res.redirect('/usuarios/login');
        }

        //verify password
        const doMatch = await bcrypt.compare(req.body.password, usuario.password);
        if (!doMatch) {
            return res.redirect('/usuarios/login');
        }

        //load user permissions
        const permisos = await model.User.getPermisos(usuario.email);
        req.session.email = usuario.email;
        req.session.rol = usuario.rol;
        req.session.isLoggedIn = true;
        req.session.permisos = permisos; 

        //redirection based on role
        switch (usuario.rol) {
            case 'admin':
                return res.redirect ('/admin/dashboard');

            case 'oficial':
                return res.redirect ('/oficial/dashboard');

            case 'operador':
                return res.redirect ('/operador/dashboard');

            case 'cliente':
                return res.redirect ('/forms/kyc-form');
        }

    } catch (e) {
        console.error(e);
        res.redirect('/usuarios/login');
    }
};

exports.get_logged = async (req, res) => {
    const email = await model.User.findByEmail(req.session.email);
    if (!email) return res.redirect('/usuarios/login');
    res.render('usuarios/logged', { user: email });
};

