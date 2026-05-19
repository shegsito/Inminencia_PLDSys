exports.index = (req, res) => {
    res.render('oficial/contratos', { 
                pageTitle: 'Contratos',
                buttonText: 'Nuevo contrato',
                buttonLink: '/oficial/registrar-contrato' 
            });
};
