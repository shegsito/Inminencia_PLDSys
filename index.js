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

    res.render('dashboard');
    }); 

app.get('/clientes', (req, res, next) => {

    res.render('clientes');
    });

app.get('/contratos', (req, res, next) => {

    res.render('contratos');
    });

app.get('/expedientes', (req, res, next) => {

    res.render('expedientes');
    });

app.get('/listas', (req, res, next) => {

    res.render('listas');
    });

app.get('/reportes', (req, res, next) => {

    res.render('reportes');
    });

app.get('/canal-interno', (req, res, next) => {

    res.render('canal-interno');
    });

app.get('/alertas', (req, res, next) => {

    res.render('alertas');
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