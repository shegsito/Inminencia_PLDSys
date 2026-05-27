const model = require('../../models/reporteModel');

exports.index = (req, res) => {
    res.render('oficial/reportes', { 
        pageTitle: 'Reportes'});
};

exports.getReportesData = async (req, res) => {
    try {
        const data = await model.fetchAll();
        res.status(200).json(data);
    } catch (e) {
        console.error("Error al obtener los reportes regulatorios:", e);
        res.status(500).json('Error al cargar la tabla de reportes regularotios.');
    }
};