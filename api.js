// 17/04/2024 - vamos criar dois novos endpoints
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const mysql_config = require('./imp/mysql_config');
const functions = require('./imp/functions');

const api_availability = true;
const api_version = '1.0.0';

const app = express();
app.listen(3000, () => {
    console.log('API em execução.');
})

app.use((req, res, next) => {
    if (api_availability) {
        next();
    } else {
        res.json(functions.response('Atenção', 'API em manutenção.', 0, null));
    }
})

const connection = mysql.createConnection(mysql_config);

app.use(cors());

//rotas
//rota inicial (rota de entrada)
app.get('/', (req, res) => {
    res.json(functions.response('sucesso', 'API rodando', 0, null));
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

//rota para fazer uma consulta de task por id
app.get('/tasks/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM tasks WHERE id  = ?', [id], (err, rows) => {
        if (!err) {
            if (rows.length > 0) {
                res.json(functions.response('Sucesso', 'Pesquisa bem sucedida', rows.length, rows));
            } else {
                res.json(functions.response('Atenção', 'Não foi encontrada a task celecionada', 0, null));
            }
        } else {
            res.json(functions.response('Erro', err.message, 0, null));
        }
    })
})

//rota para atualizar o status da task pelo id selecionado
app.put('/tasks/:id/status/:status', (req, res) => {
    const id = req.params.id;
    const status = req.params.status;
    // primeiro se informa o status pq é a coluna, depois o id 
    connection.query('UPDATE tasks SET status = ? WHERE  id = ?', [status, id], (err, rows) => {
        if (!err) {
            if (rows.affectedRows > 0) {
                res.json(functions.response('Sucesso', 'Sucesso na alteração de status', rows.affectedRows, null));
            } else {
                res.json(functions.response('Alerta vermelho', 'Task não encontrada', 0, null));
            }
        } else {
            res.json(functions.response('Erro', err.message, 0, null));
        }
    })
})





app.use((req, res) => {
    res.json(functions.response('Atenção', 'Rota não encontrada', 0, null));
})