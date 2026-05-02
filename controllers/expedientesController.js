exports.index = (req, res) => {
    res.render('expedientes', { pageTitle: 'Expedientes', buttonText: '+ Nuevo cliente' });
};
