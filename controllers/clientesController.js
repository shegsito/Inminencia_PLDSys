const ClienteModel = require('../models/clienteModel');

exports.index = async (req, res) => {
    try {
        // AJUSTE 1: Definir IDCliente para que no marque error
        const IDCliente = 'A01614777';

        // Solo para uso de prueba antes de tener datos en Supabase
        const mockCliente = { nombre_completo: "Luis Alfonso Perez", nivel_riesgo: "Bajo", rfc: "PERL900101XXX" };
        const mockContratos = [ { IDContrato: "EXP-4XXX", tipo_producto: "Factoraje", monto_limite: 900000, fecha_apertura: "2026-04-05", nivel_riesgo: "Alto" } ];
        const mockDocumentos = [ { tipo_documento: "Identificación oficial", fecha_carga: "2026-05-02", estatus: "VIGENTE" } ];

        //Comentado por la falta de conecxion directa con Supabase, pero con la funcionalidad ya hecha para cuando se tenga la conexión lista

        // const cliente = await ClienteModel.getById(IDCliente);
        // const contratos = await ClienteModel.getContratos(IDCliente);
        // await ClienteModel.logAction(req.session ? req.session.userId : 'ADMIN', `Accedió a la página del cliente ${IDCliente}`);

        // if (!cliente) {
        //     return res.status(404).send('Cliente no encontrado');
        // }

        res.render('clientes', { 
            pageTitle: 'Operación Cliente',
            //cliente: cliente || null, // codigo para conexion con Supabase
            cliente: mockCliente || null, // codigo para uso de prueba antes de tener datos en Supabase
            //contratos: contratos || [] // codigo para conexion con Supabase
            contratos: mockContratos || [], // AJUSTE 3: Cambiado a mockContratos
            documentos: mockDocumentos || [] // codigo para uso de prueba antes de tener datos en Supabase
        });
    } catch (e) {
        console.error("Error al conectar con Supabase", e);
        res.status(500).send('Error al obtener los datos del cliente');
    }
};