exports.index = (req, res) => {
    res.render('oficial/alertas', { 
                pageTitle: 'Alertas', 
                buttonText: 'Exportar',
     });
};
