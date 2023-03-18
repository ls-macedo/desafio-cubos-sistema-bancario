const express = require('express');

const { listar, criarConta, atualizarConta, deletarConta, depositar, sacar, transferir, mostrarSaldo, extrato } = require('./controladores/contas');

const { verificaEValidaSenha, verificarUnicidadeEmailECpf, verificarTodosOsCampos, verificarNumeroContaEValor } = require('./intermediarios/verificadores');

const rotas = express();

rotas.get('/contas', verificaEValidaSenha, listar);

rotas.post('/contas', verificarTodosOsCampos, verificarUnicidadeEmailECpf, criarConta);

rotas.put('/contas/:numeroConta/usuario', verificarTodosOsCampos, atualizarConta);

rotas.delete('/contas/:numeroConta', deletarConta);

rotas.post('/transacoes/depositar', verificarNumeroContaEValor, depositar);

rotas.post('/transacoes/sacar', verificarNumeroContaEValor, sacar);

rotas.post('/transacoes/transferir', transferir);

rotas.get('/contas/saldo', mostrarSaldo);

rotas.get('/contas/extrato', extrato);

module.exports = rotas;