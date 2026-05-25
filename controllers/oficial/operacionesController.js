const model = require('../../models/operacionesModel');

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

//new operacion form
exports.registrarOperacion = async (req, res) => {
    try {
        const { nombre_completo, producto, tipo, monto } = req.body;
        const { idcliente } = await model.findCliente(nombre_completo);
        const { idcontrato } = await model.findContrato(producto, idcliente);
        const idusuario = req.session.idusuario;

        if (!idcliente) {
            return res.status(400).send('Error al obtener cliente');
        }

        if (!idcontrato) {
            return res.status(400).send('Contrato no existente para ese cliente');
        }

        if (!idusuario) {
            return res.status(400).send('Sesion incorrectamente iniciada');
        }

        await model.createOperacion(idcliente, idcontrato, tipo, monto, idusuario);
        res.redirect('/oficial/operaciones?success=true')
    }
    catch(e) {
       console.log(e);
       res.status(500).send('Favor de verificar contrato existente de cliente existente.'); 
    }
};