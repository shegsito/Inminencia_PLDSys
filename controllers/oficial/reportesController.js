exports.index = (req, res) => {
    res.render('oficial/reportes', { pageTitle: 'Reportes', buttonText: 'Exportar' });
};
