exports.index = (req, res) => {
    res.render('alertas', { pageTitle: 'Alertas', buttonText: 'Exportar' });
};
