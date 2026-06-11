const pool = require('../config/db');

// QUERIES FOR LISTAS PEP
exports.countListasPEP = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM public.lista_pep_nueva');
    return rows[0].total;
};

exports.fetchAllListasPEP = async () => {
    const sql = `
        SELECT 
            id_pep AS id, 
            creado_en AS version, 
            CASE 
                WHEN creado_en = (SELECT MAX(creado_en) FROM public.lista_pep_nueva) THEN 'Activo' 
                ELSE 'Inactivo' 
            END AS estado,         
            NOW() AS cargada_en     
        FROM public.lista_pep_nueva
        ORDER BY version DESC
        LIMIT 50;                      
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

// QUERIES FOR LISTAS LPB
exports.countListasLPB = async () => {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM public.lista_lpb_nueva');
    return rows[0].total;
};

exports.fetchAllListasLPB = async () => {
    const sql = `
        SELECT 
            id_lpb AS id,        
            creado_en AS version, 
            CASE 
                WHEN creado_en = (SELECT MAX(creado_en) FROM public.lista_lpb_nueva) THEN 'Activo' 
                ELSE 'Inactivo' 
            END AS estado, 
            NOW() AS cargada_en    
        FROM public.lista_lpb_nueva
        ORDER BY version DESC
        LIMIT 50;                  
    `;
    const { rows } = await pool.query(sql);
    return rows;
};

// QUERIES FOR HISTORIAL DE LISTAS
exports.fetchHistorialListas = async () => {
    const sql = `
        SELECT 
            id_pep AS id, 
            'PEP' AS tipo_lista, 
            creado_en AS version, 
            CASE 
                WHEN creado_en = (SELECT MAX(creado_en) FROM public.lista_pep_nueva) THEN 'Activo' 
                ELSE 'Inactivo' 
            END AS estado, 
            NOW() AS cargada_en
        FROM public.lista_pep_nueva
        
        UNION ALL
        
        SELECT 
            id_lpb AS id, 
            'LPB' AS tipo_lista, 
            creado_en AS version, 
            CASE 
                WHEN creado_en = (SELECT MAX(creado_en) FROM public.lista_lpb_nueva) THEN 'Activo' 
                ELSE 'Inactivo' 
            END AS estado, 
            NOW() AS cargada_en
        FROM public.lista_lpb_nueva
        
        ORDER BY version DESC
        LIMIT 100;
    `;
    const { rows } = await pool.query(sql);
    return rows;
};