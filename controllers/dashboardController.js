exports.index = (req, res) => {
    const userRole = req.session.rol;

    switch (userRole) {
        case 'admin':
            return res.render('admin/dashboard', {
                pageTitle: "Panel de Admin"
            });

        case 'oficial':
            return res.render('dashboard', {
                pageTitle: 'Dashboard Principal',
                buttonText: '+ Nuevo cliente',
                buttonLink: '/kyc'
            });

        case 'operador':
            return res.render('operador/dashboard', {
                pageTitle: 'Dashboard Principal',
                buttonText: '+ Nuevo cliente',
                buttonLink: '/kyc'
            });

        case 'cliente':
            return res.redirect('/kyc');
    }
    
};
