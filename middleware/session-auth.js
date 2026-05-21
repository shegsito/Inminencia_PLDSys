
// Session-based auth middleware for page routes

const requireLogin = (req, res, next) => {
    if (!req.session?.isLoggedIn){
        return res.redirect('/usuarios/login');
    }

    // feed req.usuario so controlers always habe access to id + rol
    req.usuario = { id: req.session.idusuario, rol: req.session.rol};
    next();
};

// not allowed role
const requireRol = (rolesPermitidos) => (req, res, next) => {
    const rol = req.session?.rol;
    if (!rolesPermitidos.includes(rol)){
        return res.status(403).render('error', {
            codigo: 403,
            titulo: 'Acceso denegado',
            mensaje: `Tu rol (${rol}) no tiene permiso para acceder a esta sección.`,
            rol,
        });
    }
    next();
};

module.exports = { requireLogin, requireRol};
