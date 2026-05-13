// validating users id and roles with a simple role-based auth placeholder.
// THIS IS A BETA VERIFICTATION, THIS SHOULD BE REPLACED WITH SOMETHINF MORE SAFE AS JWT VERIFICATION


// first function validate the allowed roles, the second one it's just the middleware 
module.exports = (rolesPermitidos) => (req, res, next) => {
    const userID = req.headers['x-user-id'];
    const userRol = req.headers['x-user-rol'];

    if (!userID || !userRol){
        return res.status(401).json({ error: `Rol '${userRol}' no te dejo entrar we. `})
    }

    if (!rolesPermitidos.includes(userRol)){
        return res.status(403).json({ error: `Rol '${userRol}' sin permisos. Se requiere: ${rolesPermitidos.join(', ')}`});
    }

    req.usuario = { id: userID, rol: userRol };
    next();   
};

