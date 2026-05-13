/*const crypto = require('crypto');
const fs = require('fs');
const pool = require('../../config/db');
const expedienteModel = req

*/

const crypto         = require('crypto');
const fs             = require('fs');
const pool           = require('../../config/db');
const ExpedienteModel = require('../../models/expedienteModel');
const DocumentoModel  = require('../../models/documentoModel');

const TIPOS_VALIDOS = ['ine', 'rfc', 'comprobante_domicilio', 'acta_constitutiva', 'poder_notarial'];

// Calculate SHA-256 hash from a file path
const hashFile = (filePath) => new Promise((resolve, reject) => {
    const hash   = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end',  ()    => resolve(hash.digest('hex')));
    stream.on('error', reject);
});

exports.subirDocumento = async (req, res) => {
    const { idExpediente } = req.params;
    const { tipo_doc }     = req.body;
    const file             = req.file;

    // Validate file was received
    if (!file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    // Validate tipo_doc value
    if (!TIPOS_VALIDOS.includes(tipo_doc)) {
        fs.unlinkSync(file.path); // clean up uploaded file
        return res.status(400).json({ error: `tipo_doc inválido. Valores permitidos: ${TIPOS_VALIDOS.join(', ')}` });
    }

    // Check expediente exists (RN-01)
    const expediente = await ExpedienteModel.getById(idExpediente);
    if (!expediente) {
        fs.unlinkSync(file.path);
        return res.status(404).json({ error: 'Expediente no encontrado' });
    }

    // Calculate integrity hash
    const hash_int = await hashFile(file.path);

    const dbClient = await pool.connect();
    try {
        await dbClient.query('BEGIN');

        // If a previous document of same type exists, mark it as no longer current
        await DocumentoModel.marcarNoVigente(dbClient, { idexpediente: idExpediente, tipo_doc });

        // Insert new document record
        const { iddocumento } = await DocumentoModel.crear(dbClient, {
            idexpediente: idExpediente,
            cargado_por:  req.usuario.id,
            tipo_doc,
            ruta_archivo: file.path,
            formato:      file.mimetype,
            hash_int,
        });

        // Update expediente.completo if all required docs are now present
        await ExpedienteModel.actualizarCompleto(dbClient, {
            idexpediente: idExpediente,
            tipo_persona: expediente.tipo_persona,
        });

        // Audit log (RN-20)
        await dbClient.query(
            `INSERT INTO bitacora (idusuario, accion, entidad_afectada, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [req.usuario.id, 'UPLOAD_DOCUMENTO', 'documento', iddocumento, req.ip]
        );

        await dbClient.query('COMMIT');

        return res.status(201).json({
            message:    'Documento subido exitosamente',
            iddocumento,
            ruta_archivo: file.path,
        });
    } catch (e) {
        await dbClient.query('ROLLBACK');
        console.error('Error en transacción RF-02:', e);
        return res.status(500).json({ error: 'Error interno al registrar documento' });
    } finally {
        dbClient.release();
    }
};
