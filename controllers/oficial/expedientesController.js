exports.index = (req, res) => {
    res.render('oficial/expedientes', { 
        pageTitle: 'Expedientes', 
        buttonText: '+ Nuevo cliente', 
        buttonLink: '/kyc'
    });
};
