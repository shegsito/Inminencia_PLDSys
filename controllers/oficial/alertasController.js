const AlertaModel = require('../../models/alertaModel');

exports.index = (req, res) => {
    res.render('oficial/alertas', { 
                pageTitle: 'Alertas', 
     });
};

exports.getAlertasData = async (req, res) => {
    try {
        const data = await AlertaModel.fetchAllAlertas();
        res.status(200).json(data);
    } catch (e) {
        console.error("Error al obtener las alertas:", e);
        res.status(500).json('Error al cargar la tabla de alertas');
    }
};