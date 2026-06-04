const crypto = require('crypto');
const pool = require('../../config/db');
const supabase = require('../../config/supabase');
const ExpedienteModel = require('../../models/expedienteModel');
const DocumentoModel = require('../../models/documentoModel');

const TIPOS_VALIDOS = ['ine', 'rfc', 'comprobante_domicilio', 'acta_constitutiva', 'poder_notarial'];
const BUCKET = 'expedientes';

exports.subirDocumento = async (req, res) => {
    const { idExpediente } = req.params;
    const { tipo_documento } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    if (!TIPOS_VALIDOS.includes(tipo_documento)) {
        return res.status(400).json({ error: `tipo_documento inválido. Valores permitidos: ${TIPOS_VALIDOS.join(', ')}` });
    }

    const dbClient = await pool.connect();
    try {
        const expediente = await ExpedienteModel.getById(idExpediente);
        if (!expediente) {
            return res.status(404).json({ error: 'Expediente no encontrado' });
        }

        // hash from buffer (no disk read needed)
        const hash_integridad = crypto.createHash('sha256').update(file.buffer).digest('hex');

        // upload to Supabase Storage
        const ext = file.originalname.split('.').pop().toLowerCase();
        const storagePath = `${idExpediente}/${tipo_documento}_${Date.now()}.${ext}`;

const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });

        if (uploadError) throw uploadError;

        await dbClient.query('BEGIN');

        await DocumentoModel.marcarNoVigente(dbClient, { idexpediente: idExpediente, tipo_documento });

        const { iddocumento } = await DocumentoModel.crear(dbClient, {
            idexpediente: idExpediente,
            idcargadopor: req.usuario.id,
            tipo_documento,
            ruta_archivo: storagePath,
            formato: file.mimetype,
            hash_integridad,
        });

        await ExpedienteModel.actualizarCompleto(dbClient, {
            idexpediente: idExpediente,
            tipo_persona: expediente.tipo_persona,
        });

        await dbClient.query(
            `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [req.usuario.id, 'Subió documento', 'documento', iddocumento, req.ip]
        );

        await dbClient.query('COMMIT');

        return res.status(201).json({
            message: 'Documento subido exitosamente',
            iddocumento,
            ruta_archivo: storagePath,
        });
    } catch (e) {
        await dbClient.query('ROLLBACK');
        console.error('Error en transacción: ', e);
        return res.status(500).json({ error: 'Error interno al registrar documento', detalle: e?.message || String(e) });
    } finally {
        dbClient.release();
    }
};
