exports.index = (req, res) => {
    res.render('oficial/listas', { 
                pageTitle: 'Listas PEP/LPB', 
                buttonText: 'Validar'  
            });
};
