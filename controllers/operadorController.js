exports.operador_index = (req, res) => {
    res.render('/operador/dashboard', {
                pageTitle: 'Dashboard Principal',
                buttonText: '+ Nuevo cliente',
                buttonLink: '/kyc'
            });
};

exports.operador_clientes = (req, res) => {
    res.render('operador/clientes', {
                pageTitle: 'Clientes'
            });
};

exports.operador_expedientes = (req, res) => {
    res.render('operador/expedientes', {
                pageTitle: 'Expedientes de cliente'
            });
};

