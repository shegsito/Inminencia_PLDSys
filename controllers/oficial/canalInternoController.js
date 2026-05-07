exports.index = (req, res) => {
    res.render('oficial/canal-interno', { 
                pageTitle: 'Canal Interno', 
                buttonText: 'Evaluar reporte' });
};
