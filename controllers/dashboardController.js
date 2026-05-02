exports.index = (req, res) => {
    res.render('dashboard', {
        pageTitle: 'Dashboard Principal',
        buttonText: '+ Nuevo cliente',
    });
};
