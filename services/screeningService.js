const pool = require('../config/db');
const { normalizeText } = require('../utils/normalizer');

const executeScreening = async (clientPayload) => {
    const { idcliente, nombre, apellido_paterno, apellido_materno, curp } = clientPayload;
    
    const cleanNombre = normalizeText(nombre);
    const cleanPaterno = normalizeText(apellido_paterno);
    const cleanMaterno = normalizeText(apellido_materno);
    const cleanCURP = normalizeText(curp);
    const cleanFullName = normalizeText(`${cleanNombre} ${cleanPaterno} ${cleanMaterno}`);

    const openAlertSQL = `SELECT id_screening, tipo_lista FROM public.registro_screening_pld WHERE idcliente = $1 AND estatus = 'pendiente' LIMIT 1;`;
    const { rows: openAlerts } = await pool.query(openAlertSQL, [idcliente]);
    
    if (openAlerts.length > 0) {
        return {
            matchFound: true,
            action: openAlerts[0].tipo_lista === 'LPB' ? 'SILENT_HOLD' : 'ESCALATE_RISK',
            message: 'Active screening alert exists. Awaiting manual review.'
        };
    }

// Scan of the LPB list (Requiere bloqueo inmediato)
    if (cleanCURP) {
        const lpbCurpSQL = `SELECT id_lpb, nombre_completo, acuerdo, no_oficio_uif FROM public.lista_lpb_nueva WHERE UPPER(curp) = UPPER($1) LIMIT 1;`;
        const { rows: lpbCurpHits } = await pool.query(lpbCurpSQL, [cleanCURP]);
        if (lpbCurpHits.length > 0) {
            await createAlertRecord(idcliente, null, lpbCurpHits[0].id_lpb, 'LPB', 'CURP_EXACT_MATCH');
            await suspendClient(idcliente); // <-- BLOQUEO AUTOMÁTICO
            return formatComplianceOutput('LPB', 'CURP_EXACT', lpbCurpHits[0]);
        }
    }

    if (cleanNombre && cleanPaterno) { 
        const lpbSegmentSQL = `SELECT id_lpb, nombre_completo, acuerdo, no_oficio_uif FROM public.lista_lpb_nueva WHERE nombre = $1 AND apellido_paterno = $2 AND (apellido_materno = $3 OR apellido_materno IS NULL OR $3 = '') LIMIT 1;`;
        const { rows: lpbSegmentHits } = await pool.query(lpbSegmentSQL, [cleanNombre, cleanPaterno, cleanMaterno]); 
        if (lpbSegmentHits.length > 0) { 
            await createAlertRecord(idcliente, null, lpbSegmentHits[0].id_lpb, 'LPB', 'STRUCTURAL_NAME_MATCH'); 
            await suspendClient(idcliente); // <-- BLOQUEO AUTOMÁTICO
            return formatComplianceOutput('LPB', 'STRUCTURAL_NAME', lpbSegmentHits[0]); 
        }
    }

    const lpbFullNameSQL = `SELECT id_lpb, nombre_completo, acuerdo, no_oficio_uif FROM public.lista_lpb_nueva WHERE nombre_completo = $1 LIMIT 1;`; 
    const { rows: lpbFullNameHits } = await pool.query(lpbFullNameSQL, [cleanFullName]); 
    if (lpbFullNameHits.length > 0) { 
        await createAlertRecord(idcliente, null, lpbFullNameHits[0].id_lpb, 'LPB', 'FULL_NAME_MATCH'); 
        await suspendClient(idcliente); // <-- BLOQUEO AUTOMÁTICO
        return formatComplianceOutput('LPB', 'FULL_NAME', lpbFullNameHits[0]); 
    }

// Scan of the PEP list (Requiere escalamiento y alerta, no bloqueo)
    if (cleanCURP) { 
        const pepCurpSQL = `SELECT id_pep, nombre_completo FROM public.lista_pep_nueva WHERE curp = $1 LIMIT 1;`; 
        const { rows: pepCurpHits } = await pool.query(pepCurpSQL, [cleanCURP]); 
        if (pepCurpHits.length > 0) { 
            await createAlertRecord(idcliente, pepCurpHits[0].id_pep, null, 'PEP', 'CURP_EXACT_MATCH'); 
            return formatComplianceOutput('PEP', 'CURP_EXACT', pepCurpHits[0]); 
        }
    }

    if (cleanNombre && cleanPaterno) { 
        const pepSegmentSQL = `SELECT id_pep, nombre_completo FROM public.lista_pep_nueva WHERE nombre = $1 AND apellido_paterno = $2 AND (apellido_materno = $3 OR apellido_materno IS NULL OR $3 = '') LIMIT 1;`; 
        const { rows: pepSegmentHits } = await pool.query(pepSegmentSQL, [cleanNombre, cleanPaterno, cleanMaterno]); 
        if (pepSegmentHits.length > 0) { 
            await createAlertRecord(idcliente, pepSegmentHits[0].id_pep, null, 'PEP', 'STRUCTURAL_NAME_MATCH'); 
            return formatComplianceOutput('PEP', 'STRUCTURAL_NAME', pepSegmentHits[0]); 
        }
    }

    const pepFullNameSQL = `SELECT id_pep, nombre_completo FROM public.lista_pep_nueva WHERE nombre_completo = $1 LIMIT 1;`;
    const { rows: pepFullNameHits } = await pool.query(pepFullNameSQL, [cleanFullName]);
    if (pepFullNameHits.length > 0) { 
        await createAlertRecord(idcliente, pepFullNameHits[0].id_pep, null, 'PEP', 'FULL_NAME_MATCH');
        return formatComplianceOutput('PEP', 'FULL_NAME', pepFullNameHits[0]);
    }

// If no matches
    return {
        matchFound: false, 
        action: 'ALLOW_PROCEED', 
        message: 'No compliance exclusions identified.' 
    };
};

const createAlertRecord = async (idcliente, idPep, idLpb, tipoLista, metodoCoincidencia) => { 
    const insertSQL = `INSERT INTO public.registro_screening_pld (idcliente, id_pep, id_lpb, tipo_lista, metodo_coincidencia, estatus) VALUES ($1, $2, $3, $4, $5, 'pendiente');`;
    await pool.query(insertSQL, [idcliente, idPep, idLpb, tipoLista, metodoCoincidencia]);
};

// Function to suspend client immediately upon LPB match
const suspendClient = async (idcliente) => {
    const updateSQL = `UPDATE public.cliente SET estatus = 'suspendido', bloqueado = true WHERE idcliente = $1;`;
    await pool.query(updateSQL, [idcliente]);
};

const formatComplianceOutput = (tipoLista, matchType, hitDetails) => { 
    if (tipoLista === 'LPB') { 
        return {
            matchFound: true, 
            action: 'SILENT_HOLD',
            listType: 'LPB', 
            matchType, 
            complianceMetadata: { uif_oficio: hitDetails.no_oficio_uif, acuerdo_federal: hitDetails.acuerdo } 
        };
    } else { 
        return {
            matchFound: true, 
            action: 'ESCALATE_RISK', 
            listType: 'PEP', 
            matchType, 
            complianceMetadata: { nombre_registrado: hitDetails.nombre_completo } 
        };
    }
};

module.exports = { executeScreening };