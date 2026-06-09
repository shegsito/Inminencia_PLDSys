require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./config/db');

const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//middleware that exposes the views
app.use((req, _res, next) => { _res.locals.currentPath = req.path; next(); });

app.use(session({
    store: new pgSession({
        pool,
        tableName: 'session',
        createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'inminencia-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));

app.get('/', (req, res) => res.redirect('/usuarios/login'));

app.use(require('./routes'));

// 404
app.use((_req, res) => res.status(404).send('No encontrado'));

// Global error handler — prevents unhandled exceptions from crashing the serverless function
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).send('Error interno del servidor');
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
}
