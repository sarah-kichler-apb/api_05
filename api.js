// requires
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

//imports
const mysql_config = require('./imp/mysql_config');
const functions = require('./imp/functions');

//variáveis para disponibilidade e para versionamento
const api_availability = true;
const api_version = '1.0.0';

//iniciar sevidor
const app = express();
app.listen(3000, () => {
    console.log('API em execução.');
})

//verificar a disponobilidade da api
app.use((req, res, next) => {
    if (api_availability) {
        next();
    } else {
        res.json(functions.response('Atenção', 'API em manutenção.', 0, null));
    }
})

//conxão com mysql
const connection = mysql.createConnection(mysql_config);

//cors
app.use(cors());

//rotas
//rota inicial (rota de entrada)
app.get('/', (req, res) => {
    res.json(functions.response('sucesso', 'API rodando', 0, null))
})

//endpoint
//rota para a consulta completa
app.get('/tasks', (req, res) => {
    connection.query('SELECT * FROM tasks', (err, rows) => {
        if (!err) {
            res.json(functions.response('Sucesso', 'Sucesso na consulta', rows.length, rows))
        } else {
            res.json(functions.response('Erro', err.message, 0, null));
        }
    })
})

//tratar o erro da rota
app.use((req, res) => {
    res.json(functions.response('Atenção', 'Rota não encontrada', 0, null));
})