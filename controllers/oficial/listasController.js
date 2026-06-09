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
        const originalFileName = req.file.originalname;
        const tipoLista = req.body.tipo_lista;

        const idUsuario = (req.session && req.session.user && req.session.user.idusuario) 
                        || (req.user && req.user.idusuario) 
                        || null;

        if (!tipoLista) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Tipo de lista no válido o no especificado.' });
        }

        await processWatchlistUpload(filePath, tipoLista, originalFileName, idUsuario);

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
const sql = `
        SELECT 
            creado_en::text AS id, 
            creado_en AS version, 
            CASE 
                WHEN creado_en = (SELECT MAX(creado_en) FROM public.lista_pep_nueva) THEN 'Activo' 
                ELSE 'Inactivo' 
            END AS estado,         
            creado_en AS cargada_en,
            COUNT(*)::int AS total_registros     
        FROM public.lista_pep_nueva
        GROUP BY creado_en
        ORDER BY version DESC;                      
    `;
    try {
        const { rows } = await pool.query(sql);
        res.json({ data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
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
const sql = `
        SELECT 
            creado_en::text AS id,        
            creado_en AS version, 
            CASE 
                WHEN creado_en = (SELECT MAX(creado_en) FROM public.lista_lpb_nueva) THEN 'Activo' 
                ELSE 'Inactivo' 
            END AS estado, 
            creado_en AS cargada_en,
            COUNT(*)::int AS total_registros    
        FROM public.lista_lpb_nueva
        GROUP BY creado_en
        ORDER BY version DESC;                  
    `;
    try {
        const { rows } = await pool.query(sql);
        res.json({ data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.fetchHistorialListas = async (req, res) => {
const sql = `
        SELECT 
            creado_en::text AS id, 
            'PEP' AS tipo_lista, 
            creado_en AS version, 
            CASE 
                WHEN creado_en = (SELECT MAX(creado_en) FROM public.lista_pep_nueva) THEN 'Activo' 
                ELSE 'Inactivo' 
            END AS estado, 
            creado_en AS cargada_en,
            COUNT(*)::int AS total_registros
        FROM public.lista_pep_nueva
        GROUP BY creado_en
        
        UNION ALL
        
        SELECT 
            creado_en::text AS id, 
            'LPB' AS tipo_lista, 
            creado_en AS version, 
            CASE 
                WHEN creado_en = (SELECT MAX(creado_en) FROM public.lista_lpb_nueva) THEN 'Activo' 
                ELSE 'Inactivo' 
            END AS estado, 
            creado_en AS cargada_en,
            COUNT(*)::int AS total_registros
        FROM public.lista_lpb_nueva
        GROUP BY creado_en
        
        ORDER BY version DESC;
    `;
    try {
        const { rows } = await pool.query(sql);
        res.json({ data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.downloadLista = async (req, res) => {
    const { tipo } = req.params;
    try {
        if (tipo == 'LPB') {
            const { rows } = await pool.query(`
                SELECT nombre_completo, curp, rfc, fecha_nacimiento_constitucion, fecha_publicacion_acuerdo, acuerdo, no_oficio_uif, observaciones
                FROM public.lista_lpb_nueva
                ORDER BY creado_en DESC;
            `);

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=lista_lpb_actual.csv');
            res.write('\uFEFF');

        res.write('NOMBRE COMPLETO,CURP,RFC,FECHA NACIMIENTO CONSTITUCION,FECHA DE PUBLICACION DEL ACUERDO,ACUERDO,NO OFICIO UIF,OBSERVACIONES\n');

        for (const row of rows) {
                const line = [
                    `"${(row.nombre || '').replace(/"/g, '""')}"`,
                    `"${(row.apellido_paterno || '').replace(/"/g, '""')}"`,
                    `"${(row.apellido_materno || '').replace(/"/g, '""')}"`,
                    `"${(row.nombre_completo || '').replace(/"/g, '""')}"`,
                    `"${(row.curp || '').replace(/"/g, '""')}"`,
                    `"${(row.rfc || '').replace(/"/g, '""')}"`,
                    `"${(row.fecha_nacimiento_constitucion || '').replace(/"/g, '""')}"`,
                    `"${(row.fecha_publicacion_acuerdo || '').replace(/"/g, '""')}"`,
                    `"${(row.acuerdo || '').replace(/"/g, '""')}"`,
                    `"${(row.no_oficio_uif || '').replace(/"/g, '""')}"`,
                    `"${(row.observaciones || '').replace(/"/g, '""')}"`
                ].join(',');
                res.write(line + '\n');
            }
            return res.end();

            } else if (tipo === 'PEP') {
            const { rows } = await pool.query(`
                SELECT nombre, apellido_paterno, apellido_materno, nombre_completo, curp 
                FROM public.lista_pep_nueva 
                ORDER BY nombre_completo ASC;
            `);
            
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=lista_pep_actual.csv');
            res.write('\uFEFF');
            
            res.write('NOMBRE,APELLIDO PATERNO,APELLIDO MATERNO,NOMBRE COMPLETO,CURP\n');
            
            for (const row of rows) {
                const line = [
                    `"${(row.nombre || '').replace(/"/g, '""')}"`,
                    `"${(row.apellido_paterno || '').replace(/"/g, '""')}"`,
                    `"${(row.apellido_materno || '').replace(/"/g, '""')}"`,
                    `"${(row.nombre_completo || '').replace(/"/g, '""')}"`,
                    `"${(row.curp || '').replace(/"/g, '""')}"`
                ].join(',');
                res.write(line + '\n');
            }
            return res.end();
        } else {
            return res.status(400).send('Tipo de lista no válido');
        }
    } catch (error) {
        console.error("Download Error:", error);
        return res.status(500).send('Error interno al generar el archivo de descarga.');
    }
};