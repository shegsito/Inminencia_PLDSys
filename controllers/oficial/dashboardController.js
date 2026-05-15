const model = require('../../models/operacionesModel');

exports.index = (req, res) => {
    res.render('oficial/dashboard', {
        pageTitle: 'Dashboard Principal',
        buttonText: '+ Nuevo cliente',
        buttonLink: '/oficial/kyc'
    });
};

module.exports.countAlertas = async (req, res) => {
    const resultados = await model.count();
    res.status(200).json({ total : resultados });
};

exports.alertas = async (req, res) => {
    try {
        let data;
        data = await model.fetchAll();

        res.status(200).json(data);

    } catch (e) {
        console.log(e);
        res.status(500).send('Error al obtener alertas recientes');
    }
};

