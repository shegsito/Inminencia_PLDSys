const path = require('path');
const fs   = require('fs');
const pool = require('../../config/db');
const reporteModel = require('../../models/reporteModel');
const expedienteModel = require('../../models/expedienteModel');

exports.index = (req, res) => {
    res.render('oficial/reportes', { 
        pageTitle: 'Reportes', 
        buttonText: 'Exportar' });
};

exports.getCanalInternoData = async (req, res) => {
    try {
        const data = await reporteModel.fetchAll();
        res.status(200).json(data);
    } catch (e) {
        console.error("Error al obtener los reportes:", e);
        res.status(500).json('Error al cargar la tabla de reportes');
    }
};

module.exports.count = async (req, res) => {
    const resultados = await reporteModel.count();
    res.status(200).json({ total : resultados });
};