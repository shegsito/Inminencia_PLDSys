exports.operador_index = (req, res) => {
    res.render('operador/dashboard', {
                pageTitle: 'Dashboard Principal',
                buttonText: '+ Nuevo cliente',
                buttonLink: '/kyc'
            });
};