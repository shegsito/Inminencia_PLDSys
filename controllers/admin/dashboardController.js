const BitacoraModel = require('../../models/bitacoraModel');

exports.admin_index = (_req, res) => {
    res.render('admin/dashboard', { pageTitle: 'Administrar' });
};

exports.bitacora = async (req, res) => {
    const { nombre, accion, entidad, fechaInicio, fechaFin } = req.query;
    try {
        const [registros, acciones, entidades] = await Promise.all([
            BitacoraModel.getAll({ nombre, accion, entidad, fechaInicio, fechaFin }),
            BitacoraModel.getAcciones(),
            BitacoraModel.getEntidades(),
        ]);

        res.render('admin/bitacora', {
            pageTitle: 'Bitácora',
            registros,
            acciones,
            entidades,
            filtros: { nombre, accion, entidad, fechaInicio, fechaFin },
        });
    } catch (e) {
        console.error('Error al obtener bitácora:', e);
        res.status(500).send('Error al obtener la bitácora');
    }
};
