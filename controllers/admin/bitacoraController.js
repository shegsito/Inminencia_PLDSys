const BitacoraModel = require('../../models/bitacoraModel');

exports.bitacora = async (req, res) => {
    const { nombre, accion, entidad, fecha } = req.query;
    try {
        const [registros, entidades] = await Promise.all([
            BitacoraModel.getAll({ nombre, accion, entidad, fecha }),
            BitacoraModel.getEntidades(),
        ]);

        res.render('admin/bitacora', {
            pageTitle: 'Bitácora',
            registros,
            acciones: BitacoraModel.getAcciones(),
            entidades,
            filtros: { nombre, accion, entidad, fecha },
        });
    } catch(e) {
        console.error('Error al obtener bitácora:', e);
        res.status(500).send('Error al obtener la bitácora');
    }
};
