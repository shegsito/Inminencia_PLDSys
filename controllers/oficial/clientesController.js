const pool = require('../../config/db');
const supabase = require('../../config/supabase');
const ClienteModel = require('../../models/clienteModel');
const ExpedienteModel = require('../../models/expedienteModel');
const { executeScreening } = require('../../services/screeningService');

// -------------- Document viewer

// GET /oficial/documentos/:id
exports.verDocumento = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT ruta_archivo FROM documento WHERE iddocumento = $1',
            [id]
        );
        const doc = result.rows[0];
        if (!doc) return res.status(404).send('Documento no encontrado');

        const { data, error } = await supabase.storage
            .from('expedientes')
            .createSignedUrl(doc.ruta_archivo, 120);

        if (error) return res.status(500).send('Error al generar enlace del documento');

        return res.redirect(data.signedUrl);
    } catch (e) {
        console.error('Error al servir documento:', e);
        res.status(500).send('Error al obtener el documento');
    }
};

// -------------- RF-05 consulting expedient and client data

// GET /oficial/clientes
exports.index = async (_req, res) => {
    try {
        const clientes = await ClienteModel.getAll(); // get all clients

        res.render('oficial/clientes', {
            pageTitle: 'Clientes',
            clientes,
            buttonText: '+ Nuevo cliente',
            buttonLink: '/oficial/kyc',
        });
    } catch (e) {
        console.error('Error al obtener clientes:', e);
        res.status(500).send('Error al obtener los clientes');
    }
};

// GET /oficial/clientes/:id
exports.getCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const cliente = await ClienteModel.getById(id);
        if (!cliente) return res.status(404).send('Cliente no encontrado');

        const expediente = await ExpedienteModel.getByCliente(id);

        // to prevent an error while searching for expedient, just look for it if exists. If not return []
        const documentos = expediente
            ? await ExpedienteModel.getDocumentos(expediente.idexpediente)
            : [];

        // log the consultation in bitacora (uses pool directly — read-only, no transaction needed)
        await pool.query(
            `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [req.usuario?.id || null, `Consultó expediente de ${cliente.nombre} ${cliente.apellido_paterno}`, 'cliente', id, req.ip]
        );

        res.render('oficial/forms/kyc-form', {
            pageTitle: 'Expediente Cliente',
            cliente,
            expediente,
            documentos,
            modoEdicion: false, // the view uses this to know whether to show editable fields
            usuario: req.usuario,
        });
    } catch (e) {
        console.error('Error al obtener cliente:', e);
        res.status(500).send('Error al obtener el cliente');
    }
};

// -------------- RF-04 update client data and expedient

exports.actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { justificacion, ...datosFrontend } = req.body;
    const idusuario = req.usuario.id;

    // RN-03: justificación obligatoria — system does not allow saving without it
    if (!justificacion?.trim()) {
        return res.status(400).json({ error: 'La justificación es obligatoria' });
    }

    // NEW CHANGE
    // Map: form field name → actual DB column name
    // Rows that the Oficial can edit
    const camposEditables = {
        nombre:              'nombre',
        apellido_paterno:    'apellido_paterno',
        apellido_materno:    'apellido_materno',
        calle:               'calle',
        colonia:             'colonia',
        municipio:           'municipio',
        estado:              'estado',
        cp:                  'cp',
        pais:                'pais',
        telefono:            'telefono',
        email_personal:      'email',
        email_institucional: 'email_institucional',
    };

    const client = await pool.connect();
    try {
        // getting current data from DB
        const clienteActual = await ClienteModel.getById(id);
        if (!clienteActual) return res.status(404).json({ error: 'Cliente no encontrado' });

        const expediente = await ExpedienteModel.getByCliente(id);

        // comparing field by field
        const cambios = {}; // object for storing detected changes
        for (const [campoForm, campoDB] of Object.entries(camposEditables)) {

            // String() + ?? '' converts null/undefined to empty string
            // trim() removes surrounding whitespace before comparing
            const anterior = String(clienteActual[campoDB] ?? '').trim();
            const nuevo    = String(datosFrontend[campoForm] ?? '').trim();

            // if values differ, store the change indexed by DB column name
            if (anterior !== nuevo) {
                cambios[campoDB] = { anterior, nuevo };
            }
        }

        // if there were no changes, don't touch the DB
        if (Object.keys(cambios).length === 0) {
            return res.status(200).json({ mensaje: 'Sin cambios detectados' });
        }

        // start transaction
        await client.query('BEGIN');

        // register each modified field in modificacion_expediente
        for (const [campo, { anterior, nuevo }] of Object.entries(cambios)) {
            await ClienteModel.registrarModificacion(client, {
                idexpediente: expediente.idexpediente,
                idusuario,
                campo,
                valorAnterior: anterior,
                valorNuevo:    nuevo,
                justificacion: justificacion.trim(),
            });
        }

        // build object with only the changed DB columns and their new values
        const camposActualizar = {};
        for (const [campoDB, { nuevo }] of Object.entries(cambios)) {
            camposActualizar[campoDB] = nuevo;
        }

        await ClienteModel.actualizarDatos(client, id, camposActualizar);

        // register it in bitacora — uses the same client so it stays inside the transaction
        await client.query(
            `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [idusuario, `Actualizó cliente: ${Object.keys(cambios).join(', ')}`, 'cliente', id, req.ip]
        );

        await client.query('COMMIT');

        // Execute Screening in background after successful update
        try {
            const resultClient = await pool.query('SELECT * FROM cliente WHERE idcliente = $1', [id]);
            if (resultClient.rows.length > 0) {
                const updatedClient = resultClient.rows[0];
                const screeningResult = await executeScreening({
                    idcliente: updatedClient.idcliente,
                    nombre: updatedClient.nombre,
                    apellido_paterno: updatedClient.apellido_paterno,
                    apellido_materno: updatedClient.apellido_materno,
                    curp: updatedClient.curp
                });

                // If screeningResult indicates a match with LPB list, automatically block the client and generate an alert
                if (screeningResult.action === 'SILENT_HOLD') {
                    await pool.query(`
                        UPDATE public.cliente 
                        SET bloqueado = true, estatus = 'suspendido' 
                        WHERE idcliente = $1;
                    `, [updatedClient.idcliente]);

                    await pool.query(`
                        INSERT INTO public.alerta (idcliente, motivo, regla_rota, prioridad)
                        VALUES ($1, $2, 'Coincidencia con LPB', 'alta');
                    `, [updatedClient.idcliente, 'El cliente ha hecho match con la Lista de Personas Bloqueadas (LPB). Se ha suspendido su cuenta automáticamente.']);
                }
            }
        } catch (screeningErr) {
            console.error("Screening en background falló, pero el cliente fue actualizado:", screeningErr);
        }

        res.status(200).json({ mensaje: 'Cliente actualizado con éxito' });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error en transacción RF-04:', e);
        res.status(500).json({ error: 'Error interno al actualizar cliente' });
    } finally {
        client.release();
    }
};
 