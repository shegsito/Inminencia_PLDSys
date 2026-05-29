const path = require('path');
const fs = require('fs');
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
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);

        if (fs.existsSync(filePath)) {
            return res.download(filePath);
        } else {
            return res.status(404).send('Archivo no existente');
        }
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
        await model.reporteRegulatorio(fileName, formato, uploadDir, estatus, dateStr);

        return res.redirect('/oficial/reportes');
        
    } catch (e) {
        console.error(e);
        return res.status(500).send('Error al descargar archivo');
    }
};
