const model = require('../../models/operacionesModel');

exports.index = (req, res) => {
    res.render('operador/operaciones', {
        pageTitle: 'Operaciones',
        pageIcon: 'arrow-right-left',
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