const pool = require('../../config/db');
const fs = require('fs');
const csv = require('csv-parser');
const { normalizeText } = require('../../utils/normalizer');

const processWatchlistUpload = async (localCsvPath, tipoLista) => {
    const batchedRecords = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(localCsvPath)
            .pipe(csv())
            .on('data', (row) => {
                if (tipoLista === 'LPB') {
                    // Maps to the LPB columns in the lista_lpb_nueva table
                    const rawFullName = row['NOMBRE COMPLETO'] || row['nombre_completo'] || '';
                    if (rawFullName.trim()) {
                        const components = rawFullName.trim().split(' ');
                        batchedRecords.push({
                            nombre: normalizeText(components[0] || ''),
                            apellido_paterno: normalizeText(components[1] || ''),
                            apellido_materno: normalizeText(components.slice(2).join(' ') || ''),
                            nombre_completo: normalizeText(rawFullName),
                            curp: normalizeText(row['CURP'] || ''),
                            rfc: normalizeText(row['RFC'] || ''),
                            fecha_nacimiento_constitucion: (row['FECHA NACIMIENTO/CONSTITUCION'] || row['fecha_nacimiento_constitucion'] || '').trim(),
                            fecha_publicacion_acuerdo: (row['FECHA DE PUBLICACION DEL ACUERDO'] || row['fecha_publicacion_acuerdo'] || '').trim(),
                            acuerdo: (row['ACUERDO'] || row['acuerdo'] || '').trim(),
                            no_oficio_uif: (row['NO OFICIO UIF'] || row['no_oficio_uif'] || '').trim(),
                            observaciones: (row['OBSERVACIONES'] || row['observaciones'] || '').trim()
                        });
                    }
                } else if (tipoLista === 'PEP') {
                    // Maps to the PEP columns in the lista_pep_nueva table
                    const rawFullName = row['nombre_completo'] || row['NOMBRE COMPLETO'] || '';
                    if (rawFullName.trim() || row['nombre']) {
                        batchedRecords.push({
                            nombre: normalizeText(row['nombre'] || ''),
                            apellido_paterno: normalizeText(row['apellido_paterno'] || ''),
                            apellido_materno: normalizeText(row['apellido_materno'] || ''),
                            nombre_completo: normalizeText(rawFullName || `${row['nombre']} ${row['apellido_paterno']}`),
                            curp: normalizeText(row['curp'] || row['CURP'] || ''),
                            creado_en: row['creado_en'] || new Date().toISOString()
                        });
                    }
                }
            })
            .on('end', async () => {
                if (batchedRecords.length === 0) {
                    return reject(new Error('Ingestion canceled: No valid data found in source CSV file.'));
                }

                const dbClient = await pool.connect();
                try {
                    await dbClient.query('BEGIN'); 

                    if (tipoLista === 'LPB') {
                        //Delete all existing records in the LPB list before inserting the new batch
                        await dbClient.query("DELETE FROM public.lista_lpb_nueva;"); 
                        
                        const insertionSQL = `
                            INSERT INTO public.lista_lpb_nueva (
                                nombre, apellido_paterno, apellido_materno, nombre_completo,
                                curp, rfc, fecha_nacimiento_constitucion, fecha_publicacion_acuerdo,
                                acuerdo, no_oficio_uif, observaciones
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
                        `; 
                        for (const rec of batchedRecords) {
                            await dbClient.query(insertionSQL, [
                                rec.nombre, rec.apellido_paterno, rec.apellido_materno, rec.nombre_completo,
                                rec.curp, rec.rfc, rec.fecha_nacimiento_constitucion, rec.fecha_publicacion_acuerdo,
                                rec.acuerdo, rec.no_oficio_uif, rec.observaciones
                            ]);
                        }
                    } else if (tipoLista === 'PEP') {
                        //Delete all existing records in the PEP list before inserting the new batch
                        await dbClient.query("DELETE FROM public.lista_pep_nueva;");
                        const insertionSQL = `
                            INSERT INTO public.lista_pep_nueva (
                                nombre, apellido_paterno, apellido_materno, nombre_completo, curp, creado_en
                            ) VALUES ($1, $2, $3, $4, $5, $6);
                        `;
                        for (const rec of batchedRecords) {
                            await dbClient.query(insertionSQL, [
                                rec.nombre, rec.apellido_paterno, rec.apellido_materno, rec.nombre_completo, rec.curp, rec.creado_en
                            ]);
                        }
                    }

                    await dbClient.query('COMMIT'); 
                    resolve({ totalProcessed: batchedRecords.length });
                } catch (transactionError) {
                    await dbClient.query('ROLLBACK'); 
                    reject(transactionError);
                } finally {
                    dbClient.release();
                }
            })
            .on('error', (streamError) => {
                reject(streamError); 
            });
    });
};

module.exports = { processWatchlistUpload };