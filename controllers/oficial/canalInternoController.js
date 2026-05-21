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

exports.getCanalInternoData = async (req, res) => {
    try {
        const data = await canalInterno.fetchAll();
        res.status(200).json(data);
    } catch (e) {
        console.error("Error al obtener los reportes internos:", e);
        res.status(500).json('Error al cargar la tabla de reportes internos');
    }
};

module.exports.count = async (req, res) => {
    const resultados = await model.count();
    res.status(200).json({ total : resultados });
};