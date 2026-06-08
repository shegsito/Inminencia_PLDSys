const pool = require('../../config/db');
const model = require('../../models/operacionesModel');
const notificationEmitter = require('../../utils/notifier');
const { evaluateClientRisk } = require('../../utils/riskEngine');
const { executeScreening } = require('../../services/screeningService');

exports.index = (req, res) => {
    res.render('oficial/operaciones', { 
        pageTitle: 'Operaciones', 
        buttonText: 'Nueva operación', 
        buttonLink: '/oficial/registrar-operacion'
    });
};

module.exports.count = async (req, res) => {
    const resultados = await model.count();
    res.status(200).json({ total : resultados });
};

exports.operaciones = async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let data;

        if (searchTerm) {
            data = await model.findByNameOrFolio(searchTerm);
        }
        else {
            data = await model.fetchAll();
        }

        res.status(200).json(data);

    } catch (e) {
        console.log(e);
        res.status(500).send('Error al obtener operaciones');
    }
};

//display client names in drop down format GET
exports.getRegistrarOperacion = async (req, res) => {
    try{
        const cliente = await model.fetchAllClients();

        res.render('oficial/forms/nueva-operacion-form', {
        pageTitle: 'Nueva Operación',
        clientes: cliente 
    });
    } catch(e) {
        console.log(e);
        res.status(500).send('Error al cargar formulario');
    }
};

//new operacion form POST
exports.postRegistrarOperacion = async (req, res) => {
    try {
        const { idcliente, producto, tipo, monto } = req.body;
        const { idcontrato } = await model.findContrato(producto, idcliente);
        const idusuario = req.session.idusuario;
        const ipusuario = req.ip;

        if (!idcliente) {
            return res.status(400).send('Error al obtener cliente o cliente no existente.');
        }
        if (!idcontrato) {
            return res.status(400).send('Contrato no existente para ese cliente.');
        }
        if (!idusuario) {
            return res.status(400).send('Sesion incorrectamente iniciada');
        }

        // Obtain client details for screening
        const clienteQuery = await pool.query('SELECT idcliente, nombre, apellido_paterno, apellido_materno, curp FROM public.cliente WHERE idcliente = $1', [idcliente]);
        const datosCliente = clienteQuery.rows[0];

        // Run screening before registering the operation
        if (datosCliente) {
            await executeScreening(datosCliente);
        }

        // Check if client is blocked or suspended after screening results
        const statusCheck = await pool.query(`SELECT bloqueado, estatus FROM public.cliente WHERE idcliente = $1`, [idcliente]);

        if (statusCheck.rows.length > 0 && (statusCheck.rows[0].bloqueado === true || statusCheck.rows[0].estatus === 'suspendido')) {
            return res.status(403).render('oficial/operacion-denegada', {
                pageTitle: 'Operación Denegada',
                mensaje: 'Operación denegada. El cliente se encuentra suspendido o bloqueado por coincidencias en listas de riesgo.'
            });
        }

        // If screening passed, proceed to register the operation and evaluate risk
        const operacionGuardada = await model.createOperacion(idcliente, idcontrato, tipo, monto, idusuario, ipusuario);

        const motivoEvaluacion = `Nueva operación registrada: ${tipo} por el monto de $${monto}`;
        await evaluateClientRisk(idcliente, operacionGuardada.idoperacion, motivoEvaluacion);

        res.redirect('/oficial/operaciones?success=true');

    }
    catch(e) {
       console.log(e);
       res.status(500).send('Favor de verificar contrato existente de cliente existente.'); 
    }
};

exports.streamNotifications = (req, res) => {
    // Configure headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Function to send notifications to the client
    const enviarAlerta = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Listen for 'nuevaAlertaAlta' events and send them to the client
    notificationEmitter.on('nuevaAlertaAlta', enviarAlerta);

    // Clean up memory if the user closes the tab
    req.on('close', () => {
        notificationEmitter.off('nuevaAlertaAlta', enviarAlerta);
    });
};