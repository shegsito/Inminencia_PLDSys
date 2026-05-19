const model = require('../../models/contratoModel');

exports.index = (req, res) => {
    res.render('oficial/contratos', { 
                pageTitle: 'Contratos',
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

//new contrato form
exports.registrarContrato = async (req, res) => {
    try {
        const { nombre_completo, producto, fecha_init, fecha_fin, monto, estatus } = req.body;
        const { idcliente } = await model.findCliente(nombre_completo);

        if (!idcliente) {
            return res.status(400).send('Error al obtener cliente');
        }

        await model.createContrato(idcliente, producto, fecha_init, fecha_fin, monto, estatus);
        res.redirect('/oficial/contratos?success=true')
    }
    catch(e) {
       console.log(e);
       res.status(500).send('Error al regitsrar contrato'); 
    }
};