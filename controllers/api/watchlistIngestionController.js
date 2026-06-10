const pool = require('../../config/db');
const fs = require('fs');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { normalizeText } = require('../../utils/normalizer');

const processWatchlistUpload = async (source, tipoLista, originalFileName, idUsuario = null) => {
    const trackQuery = `
        INSERT INTO public.importacion_csv (idimportadopor, nombre_archivo, estatus)
        VALUES ($1, $2, 'procesando') 
        RETURNING idimportacion;
    `;
    const trackResult = await pool.query(trackQuery, [idUsuario, originalFileName]);
    const idImportacion = trackResult.rows[0].idimportacion;

    try {
        const batchedRecords = await new Promise((resolve, reject) => {
            const records = [];
            const readStream = Buffer.isBuffer(source) ? Readable.from(source) : fs.createReadStream(source);
            readStream
                .pipe(csv())
                .on('data', (row) => {
                    if (tipoLista === 'LPB') {
                        const rawFullName = row['NOMBRE COMPLETO'] || row['nombre_completo'] || '';
                        if (rawFullName.trim()) {
                            const components = rawFullName.trim().split(' ');
                            records.push({
                                nombre: normalizeText(components[0] || ''),
                                apellido_paterno: normalizeText(components[1] || ''),
                                apellido_materno: normalizeText(components.slice(2).join(' ') || ''),
                                nombre_completo: normalizeText(rawFullName),
                                curp: normalizeText(row['CURP'] || row['curp'] || ''),
                                rfc: normalizeText(row['RFC'] || row['rfc'] || ''),
                                fecha_nacimiento_constitucion: (row['FECHA NACIMIENTO/CONSTITUCION'] || row['fecha_nacimiento_constitucion'] || '').trim(),
                                fecha_publicacion_acuerdo: (row['FECHA DE PUBLICACION DEL ACUERDO'] || row['fecha_publicacion_acuerdo'] || '').trim(),
                                acuerdo: (row['ACUERDO'] || row['acuerdo'] || '').trim(),
                                no_oficio_uif: (row['NO OFICIO UIF'] || row['no_oficio_uif'] || '').trim(),
                                observaciones: (row['OBSERVACIONES'] || row['observaciones'] || '').trim()
                            });
                        }
                    } else if (tipoLista === 'PEP') {
                        const rawFullName = row['nombre_completo'] || row['NOMBRE COMPLETO'] || '';
                        if (rawFullName.trim() || row['nombre']) {
                            records.push({
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
                .on('end', () => resolve(records))
                .on('error', (err) => reject(err));
        });

        if (batchedRecords.length === 0) {
            throw new Error('El archivo CSV está vacío o no coincide con el formato esperado.');
        }

        const dbClient = await pool.connect();
        try {
            await dbClient.query('BEGIN');

            if (tipoLista === 'LPB') {
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

            await dbClient.query(`
                UPDATE public.importacion_csv 
                SET total_registros = $1, registros_ok = $1, estatus = 'completado'
                WHERE idimportacion = $2;
            `, [batchedRecords.length, idImportacion]);

            await dbClient.query('COMMIT');
            return { totalProcessed: batchedRecords.length };

        } catch (transactionError) {
            await dbClient.query('ROLLBACK');
            throw transactionError;
        } finally {
            dbClient.release();
        }

    } catch (processError) {
        console.error("[INGESTION ERROR]:", processError);
        await pool.query(`
            UPDATE public.importacion_csv 
            SET estatus = 'fallido', registros_error = total_registros
            WHERE idimportacion = $1;
        `, [idImportacion]);
        
        throw processError;
    }
};

module.exports = { processWatchlistUpload };