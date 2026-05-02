exports.index = (req, res) => {
    res.render('reportes', { pageTitle: 'Reportes', buttonText: 'Exportar' });
};
