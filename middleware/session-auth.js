
// Session-based auth middleware for page routes

const requireLogin = (req, res, next) => {
    if (!req.session?.isLoggedIn){
        return res.redirect('/usuarios/login');
    }

    // feed req.usuario so controllers always have access to id + rol
    req.usuario = { id: req.session.idusuario, rol: req.session.rol };
    // expose to all EJS templates without passing it manually from each controller
    res.locals.usuario = req.usuario;
    res.locals.readOnly = req.session?.rol === 'auditor';
    next();
};

// not allowed role — admin is super rol, always passes
const requireRol = (rolesPermitidos) => (req, res, next) => {
    const rol = req.session?.rol;
    if (rol === 'admin' || rolesPermitidos.includes(rol)){
        return next();
    }
    return res.status(403).render('error', {
        codigo: 403,
        titulo: 'Acceso denegado',
        mensaje: `Tu rol (${rol}) no tiene permiso para acceder a esta sección.`,
        rol,
    });
};

module.exports = { requireLogin, requireRol};
