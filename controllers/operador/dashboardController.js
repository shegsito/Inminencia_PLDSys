const path = require('path');
const multer = require('multer');
const fs = require('fs');
const canalInterno = require('../../models/canalInternoModel');

//create uploads folder if not existing
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
};

//uploading of evidence files
const storage = multer.diskStorage({
    destination: function (req, file, callback){
        callback(null, "./uploads");
    },
    filename: function (req, file, callback){
        callback(null, file.originalname);
    }
});

exports.upload = multer({ storage: storage }).single('evidencia');

exports.operador_index = (req, res) => { 
    res.render('operador/dashboard', {
        pageTitle: 'Dashboard Principal',
        buttonText: '+ Nuevo cliente',
        buttonLink: '/operador/kyc'
    });
};

exports.operador_reporte = (req, res) => {
    //route to connect internal report button with form
    res.render('operador/forms/reporte-interno', {
        pageTitle: "Creación de reporte interno"
    });
};

exports.operador_estatus = async (req, res) => {
    res.render('operador/caso-estatus', {
        pageTitle: "Consultar estatus de caso"
    });
};

//internal report creation with the upload of files
exports.createInternal = async (req, res) => {
    try {
        const { queja_desc, fecha_int } = req.body;
        const userId = req.session.idusuario;

        if (!userId) {
            return res.status(401).send('Sesión iniciada incorrectamente')
        }

        //user MUST input description
        if (!queja_desc) {
            return res.status(400).send('Debe entregar una descripción.')
        }
        
        //user MUST upload evidence, if not message pops up
        if (!req.file){
            res.status(400).send('Evidencia debe ser entregada.');
        }

        const ruta_evidencia = req.file.path;

        await canalInterno.reporteInterno(queja_desc, ruta_evidencia, fecha_int, userId);
        res.redirect('/operador/reportar?success=true')
    }
    catch(e) {
        console.log(e);
        res.status(500).send('Error al registrar reporte interno.'); 
    }
};

/*exports.get_evidence_file = async (req, res) => {
    const fileName = req.params.file;
    const filePath = path.join(__dirname, "./uploads", fileName);

    res.sendFile(filePath, (err) => {
        if (err){
            console.error(err);
            return res.status(404).json({code: 404, msg:"File not found"})
        }
    });
};*/

//able to see reports and status
module.exports.count = async (req, res) => {
    const resultados = await canalInterno.count();
    res.status(200).json({ total : resultados });
};

exports.casoEstatus = async (req, res) => {
    try {
        const userId = req.session.idusuario;
        
        if(!userId) {
            return res.status(400).send('No autorizado');
        }

        const data = await canalInterno.fetchAllOperador(userId);
        return res.json(data);

    } catch (e) {
        console.log(e);
        res.status(500).send('Error al obtener casos y su estatus');
    }
};