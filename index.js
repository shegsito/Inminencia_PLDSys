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
        buttonText: "+ Nuevo cliente"
    }); 
});

app.get('/clientes', (req, res, next) => {

    res.render('clientes');
    });

app.get('/contratos', (req, res, next) => {

    res.render('contratos');
    });

app.get('/expedientes', (req, res, next) => {

    res.render('expedientes', {
        buttonText: "+ Nuevo cliente"
    });
    });

app.get('/listas', (req, res, next) => {

    res.render('listas', {
        buttonText: "Validar"
    });
    });

app.get('/reportes', (req, res, next) => {

    res.render('reportes', {
        buttonText: "Exportar"
    });
    });

app.get('/canal-interno', (req, res, next) => {

    res.render('canal-interno', {
        buttonText: "Evaluar reporte"
    });
    });

app.get('/alertas', (req, res, next) => {

    res.render('alertas', {
        buttonText: "Exportar"
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