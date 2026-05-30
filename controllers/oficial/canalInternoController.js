const path = require('path');
const fs   = require('fs');
const pool = require('../../config/db');
const canalInterno = require('../../models/canalInternoModel');

exports.index = (req, res) => {
    res.render('oficial/canal-interno', { 
                pageTitle: 'Canal Interno', 
                buttonText: 'Evaluar reporte',
                buttonLink: '/oficial/evaluar-reporte' });
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
    const resultados = await canalInterno.count();
    res.status(200).json({ total : resultados });
};

//updating internal report through evaluation form
exports.evaluation = async (req, res) => {
    try {
        const { folio, estatus, resolucion } = req.body;
        const idusuario = req.session.idusuario;
        const ipusuario = req.ip;

        if (!folio) {
            return res.status(400).send('Favor de ingresar folio')
        }
        if (!resolucion) {
            return res.status(400).send('Favor de ingresar resolución')
        }

        await canalInterno.evaluateRI(folio, estatus, resolucion, idusuario, ipusuario);
        res.redirect('/oficial/evaluar-reporte?success=true')
    }
    catch(e) {
       console.log(e);
       res.status(500).send('Error al registrar evaluación del caso'); 
    }
};

//ability to retrieve files and visualize them
exports.verEvidencia = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT ruta_evidencia
            FROM reporte_interno 
            WHERE idreporteint = $1`,
            [id]
        );

        const doc = result.rows[0];

        if (!doc) {
            return res.status(404).send('Documento no encontrado')};

        const findPath = path.resolve(doc.ruta_evidencia);
        
        if (!fs.existsSync(findPath)){
            return res.status(404).send('Archivo no encontrado en el servidor')};

        //audit log captures this activity
        const idusuario = req.session.idusuario;
        const ipusuario = req.ip;

        const bitacora = `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
                          VALUES ($1, $2, $3, $4, $5, NOW())`
                          ;

        await pool.query(bitacora, [idusuario, 'Consultó evidencia', 'reporte interno', id, ipusuario]);

        //formatting since this table does not have format column
        const format = path.extname(findPath).toLowerCase();
        let contentType = 'application/octet-stream';

        if (format === '.pdf') contentType = 'application/pdf';
        else if (format === '.png') contentType = 'image/png';
        else if (format === '.jpg' || format === '.jpeg') contentType = 'image/jpeg';

        res.setHeader('Content-Type', contentType);
        res.sendFile(findPath);

    } catch (e) {
        console.error(e);
        res.status(500).send('Error al obtener evidencia');
    }
};