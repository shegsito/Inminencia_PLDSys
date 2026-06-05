const pool = require('../config/db');

const evaluateClientRisk = async (idCliente, idOperacion = null, triggerReason = "Evaluación de rutina") => {
    const clientDb = await pool.connect();
    try {
        await clientDb.query('BEGIN');

        // Fetch Acceptance Scores
        let aceptacionQuery = await clientDb.query(`SELECT * FROM public.cliente_matriz_perfil WHERE idcliente = $1`, [idCliente]);
        if (aceptacionQuery.rows.length === 0) {
            // Default score for new clients
            aceptacionQuery = await clientDb.query(`
                INSERT INTO public.cliente_matriz_perfil (idcliente) VALUES ($1) RETURNING *;
            `, [idCliente]);
        }
        const matriz = aceptacionQuery.rows[0];

        // Fetch Monitoring Scores
        let monitoreoQuery = await clientDb.query(`SELECT * FROM public.cliente_monitoreo_perfil WHERE idcliente = $1`, [idCliente]);
        if (monitoreoQuery.rows.length === 0) {
            // Default score for new clients
            monitoreoQuery = await clientDb.query(`
                INSERT INTO public.cliente_monitoreo_perfil (idcliente) VALUES ($1) RETURNING *;
            `, [idCliente]);
        }
        const monitoreo = monitoreoQuery.rows[0];

        // Calculation Logic:
        // Aceptación
        const scoreAceptacion = 
            (Number(matriz.score_cliente) * 0.60) + 
            (Number(matriz.score_jurisdiccion) * 0.20) + 
            (Number(matriz.score_productos) * 0.10) + 
            (Number(matriz.score_canales) * 0.10);
        
        // Monitoreo
        const scoreMonitoreo = 
            (Number(monitoreo.cambio_estatus) * 0.20) + 
            (Number(monitoreo.senal_alerta_historica) * 0.25) + 
            (Number(monitoreo.instrumento_monetario) * 0.15) + 
            (Number(monitoreo.pagos_exceso) * 0.10) + 
            (Number(monitoreo.frecuencia) * 0.15) + 
            (Number(monitoreo.incremento_monto) * 0.15);
        
        // Global
        const scoreGlobal = (scoreAceptacion * 0.50) + (scoreMonitoreo * 0.50);

        let nivelRiesgo = 'bajo';
        let prioridadAlerta = 'baja';
        if (scoreGlobal >= 2.50) { nivelRiesgo = 'alto'; prioridadAlerta = 'alta'; } 
        else if (scoreGlobal >= 1.75) { nivelRiesgo = 'medio'; prioridadAlerta = 'media'; }

        // Update Client Risk Profile
        await clientDb.query(`
            UPDATE public.cliente 
            SET score_riesgo = $1, nivel_riesgo = $2 
            WHERE idcliente = $3;
        `, [scoreGlobal.toFixed(4), nivelRiesgo, idCliente]);

        // Log Historical Evaluation
        await clientDb.query(`
            INSERT INTO public.evaluacion_riesgo_historico 
            (idcliente, idoperacion, score_aceptacion, score_monitoreo, score_global, nivel_riesgo_final, motivo)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [idCliente, idOperacion, scoreAceptacion.toFixed(4), scoreMonitoreo.toFixed(4), scoreGlobal.toFixed(4), nivelRiesgo.toUpperCase(), triggerReason]);

        // Automatic alert generation for high risk matrix score
        if (nivelRiesgo === 'alto') {
            const alertaMotivo = `Alerta EBR: El score global alcanzó ${scoreGlobal.toFixed(2)}. Razón: ${triggerReason}`;
            await clientDb.query(`
                INSERT INTO public.alerta (idcliente, idoperacion, motivo, regla_rota, prioridad)
                VALUES ($1, $2, $3, 'Matriz Transaccional > 2.50', $4);
            `, [idCliente, idOperacion, alertaMotivo, prioridadAlerta]);
        }

        // Only evaluate transactional rules if an operation ID was passed
        if (idOperacion) {
            // Fetch operation details and specific client profile
            const sqlOp = `
                SELECT o.monto, o.idcontrato, pt.monto_mensual_esperado, pt.frecuencia_mensual_esperada 
                FROM operacion o LEFT JOIN perfil_transaccional pt ON o.idcontrato = pt.idcontrato WHERE o.idoperacion = $1
            `;
            const opRows = await clientDb.query(sqlOp, [idOperacion]);
            
            if (opRows.rows.length > 0) {
                const montoOperacion = Number(opRows.rows[0].monto);
                const idContrato = opRows.rows[0].idcontrato;
                
                // Expected profile values
                const esperadoMonto = Number(opRows.rows[0].monto_mensual_esperado || 0);
                const esperadoFreq = Number(opRows.rows[0].frecuencia_mensual_esperada || 0);

                // Fetch Global configuration rules
                const confRows = await clientDb.query('SELECT * FROM configuracion_pld LIMIT 1');
                const configGlobal = confRows.rows[0];

                // Fetch client's real statistics for this contract in the last 30 days
                const statsRows = await clientDb.query(`
                    SELECT COUNT(*) as frecuencia, COALESCE(SUM(monto), 0) as monto_total
                    FROM operacion WHERE idcliente = $1 AND idcontrato = $2 AND fecha >= NOW() - INTERVAL '30 days'
                `, [idCliente, idContrato]);
                
                const freqMensualReal = Number(statsRows.rows[0].frecuencia);
                const montoMensualReal = Number(statsRows.rows[0].monto_total);

                let requiereAlertaTx = false;
                let motivosTx = [];
                let prioridadTx = 'media';

                // Specific Profile Rules Evaluation
                if (esperadoMonto > 0 && montoMensualReal > (esperadoMonto * 1.20)) {
                    requiereAlertaTx = true; motivosTx.push(`Acumuló $${montoMensualReal} (Esperado: $${esperadoMonto})`);
                }
                if (esperadoFreq > 0 && freqMensualReal > esperadoFreq) {
                    requiereAlertaTx = true; motivosTx.push(`Frecuencia mensual: ${freqMensualReal} ops (Esperado: ${esperadoFreq})`);
                }

                // Global Institutional Rules Evaluation
                if (configGlobal) {
                    if (montoOperacion >= Number(configGlobal.monto_inusual_unico)) { 
                        requiereAlertaTx = true; prioridadTx = 'alta'; motivosTx.push(`Monto único inusual de $${montoOperacion}`); 
                    }
                    if (montoMensualReal >= Number(configGlobal.umbral_monto_mensual)) { 
                        requiereAlertaTx = true; prioridadTx = 'alta'; motivosTx.push(`Supera umbral mensual general`); 
                    }
                    if (freqMensualReal >= Number(configGlobal.umbral_frecuencia_mensual)) { 
                        requiereAlertaTx = true; prioridadTx = 'alta'; motivosTx.push(`Supera frecuencia mensual general`); 
                    }
                }

                // Automatic alert generation for transactional threshold breaches
                if (requiereAlertaTx) {
                    await clientDb.query(`
                        INSERT INTO alerta (idcliente, idoperacion, motivo, regla_rota, prioridad)
                        VALUES ($1, $2, $3, 'Umbrales Transaccionales', $4)
                    `, [idCliente, idOperacion, `Desviación transaccional: ${motivosTx.join(' | ')}`, prioridadTx]);
                }
            }
        }

        await clientDb.query('COMMIT');
        return { scoreGlobal, nivelRiesgo };

    } catch (error) {
        await clientDb.query('ROLLBACK');
        console.error("Error in Risk Engine:", error);
        throw error;
    } finally {
        clientDb.release();
    }
};

module.exports = { evaluateClientRisk };