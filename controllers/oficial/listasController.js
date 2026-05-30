const path = require('path');
const fs   = require('fs');
const pool = require('../../config/db');
const listas = require('../../models/listasModel');
const { processWatchlistUpload } = require('../api/watchlistIngestionController');

exports.index = (req, res) => {
    res.render('oficial/listas', { 
        pageTitle: 'Listas PEP/LPB', 
        buttonText: 'Subir Lista',
        buttonLink: '/oficial/subir-lista'
    });
};

exports.uploadLista = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }
        
        const filePath = req.file.path;
        const tipoLista = req.body.tipo_lista;

        if (!tipoLista) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Tipo de lista no válido o no especificado.' });
        }

        await processWatchlistUpload(filePath, tipoLista);

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(200).json({ mensaje: `La lista ${tipoLista} se ha cargado exitosamente.` });

    } catch (e) {
        console.error("Error processing CSV:", e);
        
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({ error: 'Error interno al procesar el archivo CSV.' });
    }
}

exports.countListasPEP = async (req, res) => {
    try {
        const resultados = await listas.countListasPEP();
        res.status(200).json({ total : resultados });
    } catch(e) {
        console.error(e);
        res.status(500).send('Error al contar listas PEP');
    }
};

exports.listasPEP = async (req, res) => {
    try {
        let data = await listas.fetchAllListasPEP(); 
        res.status(200).json(data);
    } catch(e) {
        console.error(e);
        res.status(500).send('Error al obtener listas PEP');
    }
};

exports.countListasLPB = async (req, res) => {
    try {
        const resultados = await listas.countListasLPB();
        res.status(200).json({ total : resultados });
    } catch(e) {
        console.error(e);
        res.status(500).send('Error al contar listas LPB');
    }
};

exports.listasLPB = async (req, res) => {
    try {
        let data = await listas.fetchAllListasLPB();
        res.status(200).json(data);
    } catch(e) {
        console.error(e);
        res.status(500).send('Error al obtener listas LPB');
    }
};

exports.fetchHistorialListas = async (req, res) => {
    try {
        const resultados = await listas.fetchHistorialListas();
        res.status(200).json(resultados);
    } catch(e) {
        console.error("Error loading screening log history: ", e);
        res.status(500).send('Error al obtener historial de listas');
    }
};