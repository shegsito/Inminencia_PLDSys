exports.index = (req, res) => {
    res.render('oficial/operaciones', { 
        pageTitle: 'Operaciones', 
        buttonText: 'Nueva operación', 
        buttonLink: '/oficial/kyc'
    });
};
