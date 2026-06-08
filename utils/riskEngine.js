const pool = require('../config/db');
const notificationEmitter = require('./notifier');
const riskMatrix = require('./riskMatrixConfig'); 

const evaluateClientRisk = async (idCliente, idOperacion = null, triggerReason = "Evaluación de rutina") => {
    const clientDb = await pool.connect();
    try {
        await clientDb.query('BEGIN');

        // Get client information from the database
        const clienteQuery = await clientDb.query(`
            SELECT pais, estado, municipio, tipo_persona, curp 
            FROM public.cliente WHERE idcliente = $1
        `, [idCliente]);
        const cliente = clienteQuery.rows[0];

        // get producto and canal info if idOperacion is provided
        let productoNombre = 'default';
        let canalNombre = 'default';
        
        if (idOperacion) {
            const opQuery = await clientDb.query(`
                SELECT c.producto, o.tipo as canal 
                FROM operacion o 
                LEFT JOIN contrato c ON o.idcontrato = c.idcontrato 
                WHERE o.idoperacion = $1
            `, [idOperacion]);
            if (opQuery.rows.length > 0) {
                productoNombre = opQuery.rows[0].producto?.toLowerCase() || 'default';
                canalNombre = opQuery.rows[0].canal?.toLowerCase() || 'default';
            }
        }
       
        // Risk calculation based on the risk matrix configuration

        // Client-related risk factors
        let valClienteEdad = riskMatrix.values.cliente_edad['edad_26-60']; 
        if (cliente.curp && cliente.curp.length >= 10 && cliente.tipo_persona === 'fisica') {
            let year = parseInt(cliente.curp.substring(4, 6));
            year += (year >= 0 && year <= 24) ? 2000 : 1900; 
            const age = new Date().getFullYear() - year;
            
            if (age >= 18 && age <= 25) {
                valClienteEdad = riskMatrix.values.cliente_edad['edad_18-25'];
            } else if (age >= 60) {
                valClienteEdad = riskMatrix.values.cliente_edad['edad_60-75'];
            } else {
                valClienteEdad = riskMatrix.values.cliente_edad['edad_26-60'];
            }
        }
        
        const valTipoPersona = riskMatrix.values.cliente_tipo_persona[cliente.tipo_persona?.toLowerCase()] || riskMatrix.values.cliente_tipo_persona.default;
        
        // Avereging the client-related factors
        const subScoreCliente = (valClienteEdad + valTipoPersona) / 2;

        // Location-based risk factors
        const paisCliente = cliente.pais?.toLowerCase() || 'default';
        const estadoCliente = cliente.estado?.toLowerCase() || 'default';

        const valPais = riskMatrix.values.jurisdiccion_pais[paisCliente] || riskMatrix.values.jurisdiccion_pais.default;
        const valEstado = riskMatrix.values.jurisdiccion_estado[estadoCliente] || riskMatrix.values.jurisdiccion_estado.default;

        // Avereging the location-related factors
        const subScoreJurisdiccion = (valPais + valEstado) / 2;

        // Products and channels risk factors
        const subScoreProducto = riskMatrix.values.producto[productoNombre] || riskMatrix.values.producto.default;
        const subScoreCanal = riskMatrix.values.canal[canalNombre] || riskMatrix.values.canal.default;

        // Final score for acceptance phase based on the weighted average of sub-scores
        const scoreAceptacion = 
            (subScoreCliente * riskMatrix.weights.aceptacion.cliente) + 
            (subScoreJurisdiccion * riskMatrix.weights.aceptacion.jurisdiccion) + 
            (subScoreProducto * riskMatrix.weights.aceptacion.producto) + 
            (subScoreCanal * riskMatrix.weights.aceptacion.canal);

        // Operation monitoring risk factors
        let monitoreoQuery = await clientDb.query(`SELECT * FROM public.cliente_monitoreo_perfil WHERE idcliente = $1`, [idCliente]);
        if (monitoreoQuery.rows.length === 0) {
            monitoreoQuery = await clientDb.query(`
                INSERT INTO public.cliente_monitoreo_perfil (idcliente) VALUES ($1) RETURNING *;
            `, [idCliente]);
        }
        const monitoreo = monitoreoQuery.rows[0];

        // Helper function to get the value for monitoring factors, using the config mapping or defaulting to 1
        const getMonitoreoVal = (dbValue, configObject) => isNaN(Number(dbValue)) ? (configObject[dbValue?.toLowerCase()] || 1) : Number(dbValue);

        const scoreMonitoreo = 
            (getMonitoreoVal(monitoreo.cambio_estatus, riskMatrix.values.cambio_estatus) * 0.20) + 
            (getMonitoreoVal(monitoreo.senal_alerta_historica, riskMatrix.values.sign_alerta_historica) * 0.25) + 
            (Number(monitoreo.instrumento_monetario || 1) * 0.15) + 
            (getMonitoreoVal(monitoreo.pagos_exceso, riskMatrix.values.pago_en_exceso) * 0.10) + 
            (getMonitoreoVal(monitoreo.frecuencia, riskMatrix.values.frecuencia) * 0.15) + 
            (getMonitoreoVal(monitoreo.incremento_monto, riskMatrix.values.incremento_monto) * 0.15);

        // Final global score combining acceptance and monitoring scores
        const scoreGlobal = 
            (scoreAceptacion * riskMatrix.weights.global.aceptacion) + 
            (scoreMonitoreo * riskMatrix.weights.global.monitoreo);

        let nivelRiesgo = 'bajo';
        let prioridadAlerta = 'baja';
        if (scoreGlobal >= 2.50) { nivelRiesgo = 'alto'; prioridadAlerta = 'alta'; } 
        else if (scoreGlobal >= 1.75) { nivelRiesgo = 'medio'; prioridadAlerta = 'media'; }

        // Update client's risk score and level in the database
        await clientDb.query(`
            UPDATE public.cliente 
            SET score_riesgo = $1, nivel_riesgo = $2 
            WHERE idcliente = $3;
        `, [scoreGlobal.toFixed(4), nivelRiesgo, idCliente]);

        // Insert the risk evaluation into the historical table
        await clientDb.query(`
            INSERT INTO public.evaluacion_riesgo_historico 
            (idcliente, idoperacion, score_aceptacion, score_monitoreo, score_global, nivel_riesgo_final, motivo)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [idCliente, idOperacion, scoreAceptacion.toFixed(4), scoreMonitoreo.toFixed(4), scoreGlobal.toFixed(4), nivelRiesgo.toUpperCase(), triggerReason]);

        // Generate alert if the risk level is high
        if (nivelRiesgo === 'alto') {
            const alertaMotivo = `Alerta EBR: El score global alcanzó ${scoreGlobal.toFixed(2)}. Razón: ${triggerReason}`;
            await clientDb.query(`
                INSERT INTO public.alerta (idcliente, idoperacion, motivo, regla_rota, prioridad)
                VALUES ($1, $2, $3, 'Matriz Transaccional > 2.50', $4);
            `, [idCliente, idOperacion, alertaMotivo, prioridadAlerta]);

            notificationEmitter.emit('nuevaAlertaAlta', {
                motivo: alertaMotivo,
                fecha: new Date().toLocaleTimeString('es-MX')
            });
        }

        // Additional monitoring based on transaction patterns if idOperacion is provided
        if (idOperacion) {
            const sqlOp = `
                SELECT o.monto, o.idcontrato, pt.monto_mensual_esperado, pt.frecuencia_mensual_esperada 
                FROM operacion o LEFT JOIN perfil_transaccional pt ON o.idcontrato = pt.idcontrato WHERE o.idoperacion = $1
            `;
            const opRows = await clientDb.query(sqlOp, [idOperacion]);
            
            if (opRows.rows.length > 0) {
                const idContrato = opRows.rows[0].idcontrato;
                const esperadoMonto = Number(opRows.rows[0].monto_mensual_esperado || 0);
                const esperadoFreq = Number(opRows.rows[0].frecuencia_mensual_esperada || 0);

                const statsRows = await clientDb.query(`
                    SELECT COUNT(*) as frecuencia, COALESCE(SUM(monto), 0) as monto_total
                    FROM operacion WHERE idcliente = $1 AND idcontrato = $2 AND fecha >= NOW() - INTERVAL '30 days'
                `, [idCliente, idContrato]);
                
                const freqMensualReal = Number(statsRows.rows[0].frecuencia);
                const montoMensualReal = Number(statsRows.rows[0].monto_total);

                let requiereAlertaTx = false;
                let motivosTx = [];
                let prioridadTx = 'media';

                if (esperadoMonto > 0 && montoMensualReal > (esperadoMonto * 1.20)) {
                    requiereAlertaTx = true; motivosTx.push(`Acumuló $${montoMensualReal} (Esperado: $${esperadoMonto})`);
                }
                if (esperadoFreq > 0 && freqMensualReal > esperadoFreq) {
                    requiereAlertaTx = true; motivosTx.push(`Frecuencia mensual: ${freqMensualReal} ops (Esperado: ${esperadoFreq})`);
                }

                if (requiereAlertaTx) {
                    await clientDb.query(`
                        INSERT INTO alerta (idcliente, idoperacion, motivo, regla_rota, prioridad)
                        VALUES ($1, $2, $3, 'Umbrales Transaccionales', $4)
                    `, [idCliente, idOperacion, `Desviación transaccional: ${motivosTx.join(' | ')}`, prioridadTx]);
                }
            }
        }

        await clientDb.query('COMMIT'); 

    } catch (error) {
        await clientDb.query('ROLLBACK');
        console.error("Error in Risk Engine:", error);
        throw error;
    } finally {
        clientDb.release();
    }
};

module.exports = { evaluateClientRisk };