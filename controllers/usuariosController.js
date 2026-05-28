const UsuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');

module.exports.render_login = async (req, res) =>{
    res.render("usuarios/login", { registro: false });
}

module.exports.do_login = async (req, res) =>{
        try {
        const { email, password } = req.body;

        //fields must be filled in
        if (!email || !password) {
            return res.status(400).send('Please fill in all fields');
        }

        const usuario = await UsuarioModel.findByEmail(req.body.email);
        //checking for existing user
        console.log("Usuario found:", usuario);
        
        if (!usuario) {
            return res.status(400).send('Username or password incorrect');
        }

        //verify password
        const doMatch = await bcrypt.compare(password, usuario.password);
        if (!doMatch) {
            return res.status(400).send('Username or password incorrect');
        }

        //load user permissions
        //const permisos = await model.User.getPermisos(usuario.email);
        req.session.email = usuario.email;
        req.session.rol = usuario.rol;
        req.session.isLoggedIn = true;
        req.session.permisos = usuario.permisos;
        req.session.idusuario = usuario.idusuario; 

        //redirection based on role
        switch (usuario.rol) {
            case 'admin':
                return res.redirect('/admin/administrar');

            case 'oficial':
                return res.redirect ('/oficial/dashboard');

            case 'operador':
                return res.redirect ('/operador/dashboard');

            case 'cliente':
                return res.redirect('/cliente');
        }

    } catch (e) {
        console.error(e);
        res.redirect('/usuarios/login');
    }
};

/*exports.get_logged = async (req, res) => {
    const email = await model.User.findByEmail(req.session.email);
    if (!email) return res.redirect('/usuarios/login');
    res.render('usuarios/logged', { user: email });
};*/

