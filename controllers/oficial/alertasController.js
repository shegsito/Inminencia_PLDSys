const pool = require('../../config/db');
const AlertaModel = require('../../models/alertaModel');
const BitacoraModel = require('../../models/bitacoraModel');

exports.index = (req, res) => {
    res.render('oficial/alertas', { 
        pageTitle: 'Alertas y Monitoreo (EBR)'
    });
};

exports.getAlertasData = async (req, res) => {
    try {
        const rows = await AlertaModel.fetchAllAlertas();
        res.status(200).json({ data: rows });
    } catch (error) {
        console.error("Error fetching alertas:", error);
        res.status(500).json({ error: "Error al obtener alertas" });
    }
};

// GET: Show the evaluation form for an alert
exports.getEvaluarAlerta = async (req, res) => {
    const idAlerta = req.query.alerta;
    
    if (!idAlerta) {
        return res.redirect('/oficial/alertas');
    }

    try {
        // Show some context about the alert
        const sql = `
            SELECT a.idalerta, a.motivo, a.prioridad, a.estatus, 
                   c.nombre, c.apellido_paterno 
            FROM public.alerta a
            JOIN public.cliente c ON a.idcliente = c.idcliente
            WHERE a.idalerta = $1
        `;
        const { rows } = await pool.query(sql, [idAlerta]);
        
        if (rows.length === 0) return res.status(404).send('Alerta no encontrada');

        res.render('oficial/forms/evaluar-alertas-form', {
            pageTitle: 'Resolución de Alerta EBR',
            alerta: rows[0]
        });
    } catch (error) {
        console.error("Error loading alert:", error);
        res.status(500).send("Error interno al cargar la alerta");
    }
};

// POST: Save the evaluation
exports.postEvaluarAlerta = async (req, res) => {
    const { idalerta, estatus, resolucion } = req.body;
    const idusuario = req.session?.user?.idusuario || req.user?.idusuario || req.session?.idusuario;

    if (!idusuario) {
        return res.status(403).send("No autorizado. Inicie sesión.");
    }

    try {
        // Update the alerta status, resolution, and who resolved it
        const updateSql = `
            UPDATE public.alerta 
            SET estatus = $1, 
                resolucion = $2, 
                idresueltapor = $3, 
                resuelta_en = NOW()
            WHERE idalerta = $4
        `;
        await pool.query(updateSql, [estatus, resolucion, idusuario, idalerta]);

        // Log this action in the bitácora
        await BitacoraModel.registrarAccion({
            idusuario: idusuario,
            accion: 'Evaluó alerta',
            entidad_afect: 'alerta',
            id_entidad: idalerta,
            ip_origen: req.ip
        });

        res.redirect('/oficial/alertas?success=true');
    } catch (error) {
        console.error("Error resolving alert:", error);
        res.status(500).send("Error interno al guardar la resolución");
    }
};