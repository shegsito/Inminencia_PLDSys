const model = require('../../models/contratoModel');

exports.index = (req, res) => {
    res.render('oficial/contratos', {
                pageTitle: 'Contratos',
                pageIcon: 'file-text',
                buttonText: 'Nuevo contrato',
                buttonLink: '/oficial/registrar-contrato'
            });
};

module.exports.count = async (req, res) => {
    const resultados = await model.count();
    res.status(200).json({ total : resultados });
};

exports.contratos = async (req, res) => {
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
        res.status(500).send('Error al obtener contratos');
    }
};

//display client names in drop down format GET
exports.getRegistrarContrato = async (req, res) => {
    try{
        const cliente = await model.fetchAllClients();

        res.render('oficial/forms/nuevo-contrato-form', {
        pageTitle: 'Nuevo contrato',
        pageIcon: 'file-text',
        clientes: cliente
    });
    } catch(e) {
        console.log(e);
        res.status(500).send('Error al cargar formulario');
    }
};

//new contrato form POST
exports.postRegistrarContrato = async (req, res) => {
    try {
        const { idcliente, producto, fecha_init, fecha_fin, monto, estatus } = req.body;
        const idusuario = req.session.idusuario;
        const ipusuario = req.ip;

        if (!idcliente) {
            return res.status(400).send('Error al obtener cliente o cliente no existente.');
        }

        await model.createContrato(idcliente, producto, fecha_init, fecha_fin, monto, estatus, idusuario, ipusuario);
        res.redirect('/oficial/contratos?success=true')
    }
    catch(e) {
       console.log(e);
       res.status(500).send('Favor de verificar cliente existente.'); 
    }
};