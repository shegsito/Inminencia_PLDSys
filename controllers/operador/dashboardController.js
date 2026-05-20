exports.operador_index = (req, res) => {
    res.render('operador/dashboard', {
                pageTitle: 'Dashboard Principal',
                buttonText: '+ Nuevo cliente',
                buttonLink: '/oficial/kyc'
            });
};

exports.operador_reporte = (req, res) => {
    //route to connect report creation button with form
    res.render('operador/forms/caso-sospechoso', {
        pageTitle: "Reporte de caso sospechoso"
    });
};



