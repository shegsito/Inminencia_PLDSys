const pool = require('../../config/db');

exports.index = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT idcliente FROM cliente WHERE idusuario = $1',
            [req.usuario.id]
        );

        if (rows[0]) {
            return res.render('cliente/gracias', { pageTitle: 'Registro completado' });
        }

        res.render('cliente/registro', { pageTitle: 'Registra tus datos' });
    } catch (e) {
        console.error('Error en vista cliente:', e);
        res.status(500).send('Error interno');
    }
};
