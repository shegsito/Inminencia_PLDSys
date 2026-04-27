const http    = require('http');
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const app     = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send("Hola Mundo");
    res.end(); 
});

app.get('/dashboard', (req, res, next) => {

    res.render('dashboard', {
        buttonText: "+ Nuevo cliente",
        pageTitle: "Dashboard Principal"
    }); 
});

app.get('/clientes', (req, res, next) => {

    res.render('clientes', {
        pageTitle: "Operacion Cliente"
    });
    });

app.get('/contratos', (req, res, next) => {

    res.render('contratos', {
        pageTitle: "Contratos"
    });
    });

app.get('/expedientes', (req, res, next) => {

    res.render('expedientes', {
        buttonText: "+ Nuevo cliente",
        pageTitle: "Expedientes"
    });
    });

app.get('/listas', (req, res, next) => {

    res.render('listas', {
        buttonText: "Validar",
        pageTitle: "Listas PEP/LPB"
    });
    });

app.get('/reportes', (req, res, next) => {

    res.render('reportes', {
        buttonText: "Exportar",
        pageTitle: "Reportes"
    });
    });

app.get('/canal-interno', (req, res, next) => {

    res.render('canal-interno', {
        buttonText: "Evaluar reporte",
        pageTitle: "Canal Interno"
    });
    });

app.get('/alertas', (req, res, next) => {

    res.render('alertas', {
        buttonText: "Exportar",
        pageTitle: "Alertas"
    });
});

/*app.get('/login', (req, res, next) => {

    res.render('login');
    });

app.get('/kyc', (req, res, next) => {

    res.render('kyc');
    });*/


const server = http.createServer( (req, res) => {    
console.log(req.url);
});
app.listen(3001);