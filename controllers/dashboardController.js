
exports.index = (req, res) => {
    const userRole = req.session.rol;

    switch (userRole) {
        
        case 'oficial':
            return res.render('oficial/dashboard', {
                pageTitle: 'Dashboard Principal',
                buttonText: '+ Nuevo cliente',
                buttonLink: '/kyc'
            });

        case 'cliente':
            return res.redirect('/kyc');
    }
    
};