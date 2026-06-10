const pool = require('../../config/db');
const BitacoraModel = require('../../models/bitacoraModel');

exports.getPerfil = async (req, res) => {
    const idcontrato = req.params.id;
    try {
        // Fetch existing perfil_transaccional data for this contrato, if any
        const sql = `
            SELECT c.idcontrato, c.idcliente, p.monto_mensual_esperado, p.frecuencia_mensual_esperada
            FROM contrato c
            LEFT JOIN perfil_transaccional p ON c.idcontrato = p.idcontrato
            WHERE c.idcontrato = $1
        `;
        const { rows } = await pool.query(sql, [idcontrato]);
        
        if (rows.length === 0) return res.status(404).send('Contrato no encontrado');

        res.render('oficial/forms/perfil-transaccional-form', {
            pageTitle: 'Establecer Perfil Transaccional',
            contrato: rows[0],
            success: req.query.success === 'true'
        });
    } catch (error) {
        console.error("Error cargando perfil:", error);
        res.status(500).send("Error interno");
    }
};

exports.postPerfil = async (req, res) => {
    const idcontrato = req.params.id;
    const { idcliente, monto_mensual_esperado, frecuencia_mensual_esperada } = req.body;

    try {
        // Insert or update the perfil_transaccional for this contrato
        const sql = `
            INSERT INTO perfil_transaccional (idcliente, idcontrato, monto_mensual_esperado, frecuencia_mensual_esperada)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (idcontrato) DO UPDATE 
            SET monto_mensual_esperado = EXCLUDED.monto_mensual_esperado,
                frecuencia_mensual_esperada = EXCLUDED.frecuencia_mensual_esperada,
                actualizado_en = NOW()
        `;
        await pool.query(sql, [idcliente, idcontrato, monto_mensual_esperado, frecuencia_mensual_esperada]);

        // Log this action in the bitácora
        if (idUsuario) {
            await BitacoraModel.registrarAccion({
                idusuario: idUsuario,
                accion: 'Actualizó perfil transaccional',
                entidad_afect: 'perfil_transaccional',
                id_entidad: idcontrato,
                ip_origen: req.ip
            });
        }
        
        res.redirect(`/oficial/contratos/perfil/${idcontrato}?success=true`);
    } catch (error) {
        console.error("Error guardando perfil:", error);
        res.status(500).send("Error al guardar");
    }
};