const pool = require('../../config/db');
const supabase = require('../../config/supabase');
const model = require('../../models/reporteModel');

const BUCKET = 'reportes';

exports.index = (req, res) => {
    res.render('oficial/reportes', {
        pageTitle: 'Reportes',
        buttonText: 'Generar reporte',
        buttonLink: '/oficial/reportes/generar'
    });
};

exports.getReportesData = async (req, res) => {
    try {
        const data = await model.fetchAll();
        res.status(200).json(data);
    } catch (e) {
        console.error("Error al obtener los reportes regulatorios:", e);
        res.status(500).json('Error al cargar la tabla de reportes regulatorios.');
    }
};

exports.downloadReport = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT ruta_archivo FROM reporte_regulatorio WHERE idreporter = $1::uuid`,
            [id]
        );
        const doc = result.rows[0];
        if (!doc) return res.status(404).send('Documento no encontrado');

        // generate a signed URL valid for 60 seconds
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(doc.ruta_archivo, 60);

        if (error) throw error;

        const idusuario = req.session.idusuario;
        await pool.query(
            `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [idusuario, 'Descargó reporte regulatorio', 'reporte regulatorio', id, req.ip]
        );

        return res.redirect(data.signedUrl);
    } catch (e) {
        console.error(e);
        return res.status(500).send('Error al descargar archivo');
    }
};

exports.dailyReport = async (req, res) => {
    try {
        const clients  = await model.fetchDailyClients();
        const activity = await model.fetchDailyActivity();
        const idusuario = req.session.idusuario;

        const dateStr  = new Date().toISOString().split('T')[0];
        const fileName = `reporte_diario_${dateStr}.txt`;

        let fileContent = `Clientes registrados (${dateStr})\n`;
        fileContent += `==================================================\n\n`;

        if (clients.length === 0) {
            fileContent += `Sin clientes nuevos hoy.\n`;
        } else {
            clients.forEach(c => {
                fileContent += `ID: ${c.idcliente} | Nombre: ${c.nombre_cliente} | Email: ${c.email}\n`;
            });
        }

        fileContent += '\n\n';
        fileContent += `==================================================\n`;
        fileContent += `Actividad general (${dateStr})\n`;
        fileContent += `==================================================\n\n`;

        if (activity.length === 0) {
            fileContent += `Sin actividad.\n`;
        } else {
            activity.forEach(a => {
                fileContent += `ID de usuario: ${a.idusuario} | Acción: ${a.accion} | Entidad afectada: ${a.entidad_afect}\n`;
            });
        }

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(fileName, Buffer.from(fileContent, 'utf8'), {
                contentType: 'text/plain',
                upsert: true,
            });

        if (uploadError) throw uploadError;

        await model.reporteRegulatorio('REPORTE DIARIO', 'TXT', fileName, 'generado', dateStr, idusuario, req.ip);

        return res.redirect('/oficial/reportes');
    } catch (e) {
        console.error(e);
        return res.status(500).send(`Error al generar reporte: ${e?.message || String(e)}`);
    }
};

exports.getCanalInternoData = async (req, res) => {
    try {
        const data = await model.fetchAll();
        res.status(200).json(data);
    } catch (e) {
        console.error("Error al obtener los reportes:", e);
        res.status(500).json('Error al cargar la tabla de reportes');
    }
};

module.exports.count = async (req, res) => {
    try {
        const resultados = await model.count();
        res.status(200).json({ total: resultados });
    } catch (e) {
        res.status(500).json({ total: 0 });
    }
};
