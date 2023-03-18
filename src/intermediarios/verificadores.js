const e = require('express');
const { instituicao } = require('../bancodedados');

const verificaEValidaSenha = (req, res, next) => {
        const { senha_banco } = req.query;

        if(!senha_banco){
            return res.status(401).json({ "mensagem": "A senha não foi informada!"});
        }

        if(senha_banco !== instituicao.banco.senha){
            return res.status(401).json({ "mensagem": "Senha incorreta!" })
        }

        next();
}

const verificarUnicidadeEmailECpf = (req, res, next) => {
        const { email, cpf } = req.body;

        const exiteEmail = instituicao.contas.find((conta) => {
            return conta.usuario.email == email;
        });

        const exiteCpf = instituicao.contas.find((conta) => {
            return conta.usuario.cpf == cpf;
        });

        if(exiteCpf){
            return res.status(400).json({ "mensagem": "Já existe uma conta vinculado ao CPF informado." });
        };

        if(exiteEmail){
            return res.status(400).json({ "mensagem": "Já existe uma conta vinculado ao Email informado" });
        };

        next();
}

const verificarTodosOsCampos = (req, res, next) => {
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

        if(!nome){
            return res.status(400).json({ "mensagem": "O campo nome deve ser informado!" });
        };

        if(!cpf){
            return res.status(400).json({ "mensagem": "O campo cpf deve ser informado!" });
        };

        if(!data_nascimento){
            return res.status(400).json({ "mensagem": "O campo data de nascimento deve ser informado!" });
        };

        if(!telefone){
            return res.status(400).json({ "mensagem": "O campo telefone deve ser informado!" });
        };

        if(!email){
            return res.status(400).json({ "mensagem": "O campo email deve ser informado!" });
        };

        if(!senha){
            return res.status(400).json({ "mensagem": "O campo senha deve ser informado!" });
        };

        next();
}

const verificarNumeroContaEValor = (req, res, next) => {
    const { numero_conta, valor } = req.body

    if(!numero_conta){
        return res.status(400).json({ "mensagem": "O número da conta deve ser informado!" });
    }

    if(!valor){
        return res.status(400).json({ "mensagem": "O valor a depositar deve ser informado!" });
    }

    next();
}

module.exports = {
    verificaEValidaSenha,
    verificarUnicidadeEmailECpf,
    verificarTodosOsCampos,
    verificarNumeroContaEValor
}