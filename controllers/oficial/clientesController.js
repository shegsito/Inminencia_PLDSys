// i (sheg) reworked this controller...

const pool = require('../../config/db');
const ClienteModel = require('../../models/clienteModel');
const ExpedienteModel = require('../../models/expedienteModel');

// -------------- RF-05 consulting expedient and client data 

// GET /oficial/clientes
exports.index = async (req, res) => {
    try {
        const clientes = await ClienteModel.getAll(); // get all clients 

        res.render('oficial/clientes', {
            pageTitle: 'Clientes',
            clientes
        });
    } catch (e) {
        console.error('Error al obtener clientes:', e);
        res.status(500).send('Error al obtener los clientes');
    }
};

// GET /oficial/clientes/:id
exports.getCliente = async (req, res) => {
    try{
        const { id } = req.params;

        const cliente = await ClienteModel.getById(id);
        if (!cliente) return res.status(400).send('CLiente no encontrado');

        const expediente = await ExpedienteModel.getByCliente(id);
        
        // to prevent an error while searching for expedient, just look fot it if exists. If not return false
        const documentos = expediente ? await ExpedienteModel.getDocumentos(expediente.IDExpediente) : [];

        // try checking this part, it may be wrong
        await ClienteModel.logAction(
            req.usuario.IDUsuario,
            `Consultó expediente del cliente ${id}`
        );

        res.render('oficial/forms/kyc-form', {
            pageTitle: 'Expediente Cliente',
            cliente,
            expediente,
            documentos,
            modoEdicion: false // the view uses this to know if show the editable rows
        });
    } catch (e) {
        console.error('Error al obtener cliente:', e);
        res.status(500).send('Error al obtener el cliente');
    }
};

// --------------RF-04 update client data and expedient

exports.actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { justificacion, ...datosFrontend } = req.body;
    const idUsuario = req.usuario.IDUsuario;
    
    // Rows that the Oficial can edit
    const camposEditables = [
        'nombre_completo', 'domicilio', 'telefono',
        'email_personal' , 'email_institucional'
    ];

    const client = await pool.connect();

    try {
        // getting data from DB
        const clienteActual = await ClienteModel.getById(id);
        if (!clienteActual) return res.status(404).json({ error: 'Cliente no encontrado'});

        const expediente = await ExpedienteModel.getByCliente(id);

        // comparing row by row
        const cambios = {}; // array for storing changes
        for (const campo of camposEditables) {

            // 1. Converting data to string, to avoid returning indefined data
            // 2. ??'' this converts the null or ondefined into void text ' '
            // 3. and trim just erases the blank spaces...
            const anterior = String(clienteActual[campo] ?? '').trim();
            const nuevo = String(datosFrontend[campo] ?? '').trim();

            // if the rows are different, it stores them in cambios array
            if (anterior !== nuevo){
                cambios[campo] = { anterior, nuevo };
            }
        }

        // if there weren't any change, dont touch db
        if (Object.keys(cambios).lenght === 0){
            return res.status(200).json({ mensaje: 'Sin cambios detectados'});
        }

        // start transaction
        await client.query('BEGIN');

        // Register each modified row, into Mmodificacion_expediente
        for (const [campo, {anterior, nuevo}] of Object.entries(cambios)){
            await ClienteModel.registrarModificacion(client, {
                IDExpediente: expediente.IDExpediente,
                idUsuario,
                campo,
                valorAnterior: anterior,
                valorNuevo: nuevo,
                justificacion
            });
        }

        //  building object with the changed rows
        const camposActualizar = {};
        for (const campo of Object.keys(cambios)){
            camposActualizar[campo] = datosFrontend[campo];
        }

        await ClienteModel.actualizarDatos(client, id, camposActualizar);

        // register it into log (bitacora)
        await ClienteModel.logAction(idUsuario,
            `Actualizó datos del cliente ${id}: ${Object.keys(cambios).join(', ')}`
        );

        await client.query('COMMIT');
        
        res.status(200).json({ mensaje: 'Cliente actualizado con éxito'});
    } finally {
        client.release();
    }
};