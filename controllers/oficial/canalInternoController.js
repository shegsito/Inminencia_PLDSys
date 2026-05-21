const path = require('path');
const fs   = require('fs');
const pool = require('../../config/db');
const canalInterno = require('../../models/canalInternoModel');
const expedienteModel = require('../../models/expedienteModel');

exports.index = (req, res) => {
    res.render('oficial/canal-interno', { 
                pageTitle: 'Canal Interno', 
                buttonText: 'Evaluar reporte' });
};

module.exports.count = async (req, res) => {
    const resultados = await model.count();
    res.status(200).json({ total : resultados });
};