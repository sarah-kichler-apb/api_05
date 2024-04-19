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

//inserindo o tratamento dos params---------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//------------------------------------------------------------------------------------------

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

//rota para excluir uma task
app.delete('/tasks/:id/delete', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM tasks WHERE id = ?', [id], (err, rows) => {
        if (!err) {
            if (rows.affectedRows > 0) {
                res.json(functions.response('Sucesso', 'Task deletada', rows.affectedRows, null))
            }
            else {
                res.json(functions.response('Atenção', 'Task não encontrada', 0, null))
            }
        }
        else {
            res.json(functions.response('Erro', err.message, 0, null))
        }
    })
})

//endpoint para adicionar uma nova task
app.post('/tasks/create', (req, res) => {
    //como a task é um texto e o status também, precisaremos, através da rota, adicionar midleware (tudo adicionado durante a rota)
    const post_data = req.body;

    if (post_data == undefined) {
        res.json(functions.response('Atenção', 'Sem os dados necessários para criação de uma nova task', 0, null));
        return;
    }
    //checar se os dados informados são inválidos
    if (post_data.task == undefined || post_data.status == undefined) {
        res.json(functions.response('Atenção', 'Dados inválidos', 0, null));
        return;
    }

    // pegar os dados da task
    const task = post_data.task;
    const status = post_data.status;

    // inserir a task
    connection.query('INSERT INTO tasks (task,status,created_at,updated_at) VALUES (?,?,NOW(),NOW())', [task, status],(err,rows)=>{
        if (!err) {
            res.json(functions.response('Sucesso', 'Task cadastrada com sucesso', rows.affectedRows, null));
        } else {
            res.json(functions.response('Erro', err.message, 0, null));
        }
    })
})

app.use((req, res) => {
    res.json(functions.response('Atenção', 'Rota não encontrada', 0, null));
})