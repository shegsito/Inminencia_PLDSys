const path = require('path');
const fs = require('fs');
const pool = require('../../config/db');
const model = require('../../models/reporteModel');

//if not existing, create reports folder
const uploadDir = './reports';
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        };

//render page
exports.index = (req, res) => {
    res.render('oficial/reportes', { 
        pageTitle: 'Reportes',
        buttonText: 'Generar reporte', 
        buttonLink: '/oficial/reportes/generar'
    });
};

//fill table
exports.getReportesData = async (req, res) => {
    try {
        const data = await model.fetchAll();
        res.status(200).json(data);
    } catch (e) {
        console.error("Error al obtener los reportes regulatorios:", e);
        res.status(500).json('Error al cargar la tabla de reportes regulatorios.');
    }
};

//way to download reports
exports.downloadReport = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT ruta_archivo
            FROM reporte_regulatorio 
            WHERE idreporter = $1::uuid`,
            [id]
        ); 
        const doc = result.rows[0];

        if (!doc) {
            return res.status(404).send('Documento no encontrado')};

        const findPath = path.resolve(doc.ruta_archivo);
                
        if (!fs.existsSync(findPath)){
            return res.status(404).send('Archivo no encontrado en el servidor')}; 

        //audit log captures this activity
        const idusuario = req.session.idusuario;
        const ipusuario = req.ip;

        const bitacora = `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
                          VALUES ($1, $2, $3, $4, $5, NOW())`
                          ;

        await pool.query(bitacora, [idusuario, 'DESCARGAR REPORTE REGULATORIO', 'reporte regulatorio', id, ipusuario]);
        
        return res.download(findPath);

    } catch (e) {
        console.error(e);
        return res.status(500).send('Error al descargar archivo');
    }
};

//daily report generation
exports.dailyReport = async (req, res) => {
    try {
        const clients = await model.fetchDailyClients();
        const activity = await model.fetchDailyActivity();
        const idusuario = req.session.idusuario;
        const ipusuario = req.ip;
            
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `reporte_diario_${dateStr}.txt`;

        let fileContent = `Clientes registrados (${dateStr})\n`;
        fileContent += `==================================================\n\n`;
            
        if (clients.length === 0) {
            fileContent += `Sin clientes nuevos hoy.\n`;
        } else {
            clients.forEach(client => {
                fileContent += `ID: ${client.idcliente} | Nombre: ${client.nombre_cliente} | Email: ${client.email}\n`;
            });
        }

        fileContent += '\n\n';

        fileContent += `==================================================\n`;
        fileContent += `Actividad general (${dateStr})\n`;
        fileContent += `==================================================\n\n`;
            
        if (activity.length === 0) {
            fileContent += `Sin actividad.\n`;
        } else {
            activity.forEach(act => {
                fileContent += `ID de usuario: ${act.idusuario} | Acción: ${act.accion} | Entidad afectada: ${act.entidad_afect}\n`;
            });
        }
            
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`Report successfully generated at: ${filePath}`);

        const estatus = 'generado';
        const formato = 'TXT';
        const tipo = 'REPORTE DIARIO';
        await model.reporteRegulatorio(tipo, formato, filePath, estatus, dateStr, idusuario, ipusuario);
        return res.redirect('/oficial/reportes');
        
    } catch (e) {
        console.error(e);
        return res.status(500).send('Error al descargar archivo');
    }
};
