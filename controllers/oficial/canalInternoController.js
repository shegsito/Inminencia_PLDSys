const pool = require('../../config/db');
const supabase = require('../../config/supabase');
const canalInterno = require('../../models/canalInternoModel');

exports.index = (req, res) => {
    res.render('oficial/canal-interno', {
                pageTitle: 'Canal Interno',
                pageIcon: 'megaphone',
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

exports.getEvaluation = async (req, res) => {
    try {
        const folio = await canalInterno.fetchAll();

        res.render('oficial/forms/evaluar-caso-form', {
        pageTitle: 'Forma de evaluación',
        pageIcon: 'megaphone',
        folios: folio });

    } catch(e) {
        console.log(e);
        res.status(500).send('Error al cargar formulario de evaluación');
    }
};

//updating internal report through evaluation form
exports.postEvaluation = async (req, res) => {
    try {
        const { idreporteint, estatus, resolucion } = req.body;
        const idusuario = req.session.idusuario;
        const ipusuario = req.ip;

        if (!idreporteint) {
            return res.status(400).send('Favor de ingresar folio')
        }
        if (!resolucion) {
            return res.status(400).send('Favor de ingresar resolución')
        }

        await canalInterno.evaluateRI(idreporteint, estatus, resolucion, idusuario, ipusuario);
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
        if (!doc) return res.status(404).send('Documento no encontrado');

        const { data, error } = await supabase.storage
            .from('reportes')
            .createSignedUrl(doc.ruta_evidencia, 120);

        if (error) return res.status(500).send('Error al generar enlace de evidencia');

        const idusuario = req.session.idusuario;
        await pool.query(
            `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [idusuario, 'Consultó evidencia', 'reporte interno', id, req.ip]
        );

        return res.redirect(data.signedUrl);

    } catch (e) {
        console.error(e);
        res.status(500).send('Error al obtener evidencia');
    }
};