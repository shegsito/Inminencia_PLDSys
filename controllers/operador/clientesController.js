const pool = require('../../config/db');
const ClienteModel = require('../../models/clienteModel');
const ExpedienteModel = require('../../models/expedienteModel');

// -------------- RF-05 consulting expedient and client data

// GET /operador/clientes
exports.index = async (req, res) => {
    try {
        const clientes = await ClienteModel.getAll(); // get all clients

        res.render('operador/clientes', {
            pageTitle: 'Clientes',
            pageIcon: 'users',
            clientes,
            buttonText: '+ Nuevo cliente',
            buttonLink: '/operador/kyc',
        });
    } catch (e) {
        console.error('Error al obtener clientes:', e);
        res.status(500).send('Error al obtener los clientes');
    }
};

// GET /operador/clientes/:id
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
            [req.usuario?.id || null, `Consultó expediente del cliente ${id}`, 'cliente', id, req.ip]
        );

        res.render('oficial/forms/kyc-form', {
            pageTitle: 'Expediente Cliente',
            pageIcon: 'user-round',
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
 