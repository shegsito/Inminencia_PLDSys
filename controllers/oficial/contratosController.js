const model = require('../../models/contratoModel');

exports.index = (req, res) => {
    res.render('oficial/contratos', { 
                pageTitle: 'Contratos',
                buttonText: 'Nuevo contrato',
                buttonLink: '/oficial/registrar-contrato' 
            });
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