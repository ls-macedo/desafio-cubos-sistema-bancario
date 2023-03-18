let { instituicao } = require('../bancodedados');

const { format } = require('date-fns');

let id = 1;

const listar = (req, res) => {
    res.status(200).json(instituicao.contas);
}

const criarConta = (req, res) => {
    try {
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
        
        const novaConta = {
            numero: ++id,
            saldo: 0,
            usuario: {
                nome,
                cpf,
                data_nascimento,
                telefone,
                email,
                senha
            }
        }

        instituicao.contas.push(novaConta);

        return res.status(201).json();
    } catch (error) {
        return res.status(500).json({ "mensagem": `Erro: ${error.message}`})
    }
}

const atualizarConta = (req, res) => {
    const { numeroConta } = req.params;
    

    if(isNaN(Number(numeroConta))){
        return res.status(400).json({ "mensagem": "Numero da conta inválido!" });
    }

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if(cpf) {
        const exiteCpf = instituicao.contas.find((conta) => {
            return conta.usuario.cpf == cpf;
        });

        if(exiteCpf){
            return res.status(400).json({ "mensagem": "Já existe uma conta vinculado ao CPF informado." });
        };
    }

    if(email) {
        const exiteEmail = instituicao.contas.find((conta) => {
            return conta.usuario.email == email;
        });

        if(exiteEmail){
            return res.status(400).json({ "mensagem": "Já existe uma conta vinculado ao Email informado" });
        };
    }

    const usuarioAtualizado = instituicao.contas.find((conta) => {
        return conta.numero === Number(numeroConta);
    });

    usuarioAtualizado.usuario.nome = nome;
    usuarioAtualizado.usuario.cpf = cpf;
    usuarioAtualizado.usuario.data_nascimento = data_nascimento;
    usuarioAtualizado.usuario.telefone = telefone;
    usuarioAtualizado.usuario.email = email;
    usuarioAtualizado.usuario.senha = senha;

    return res.status(204).json();
}

const deletarConta = (req, res) => {
    const { numeroConta } = req.params;

    if(isNaN(Number(numeroConta))){
        return res.status(400).json({ "mensagem": "Numero da conta inválido!" });
    };

    const contaParaSerExcluida = instituicao.contas.find((conta) => {
        return conta.numero === Number(numeroConta);
    });

    if(contaParaSerExcluida.saldo !== 0){
        return res.status(400).json({ "mensagem": "O saldo precisa estar zerado para que a conta seja excluida!" });
    };

    instituicao.contas = instituicao.contas.filter((conta) => {
        return conta.numero !== Number(numeroConta);
    });

    return res.status(204).json();
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    if(Number(valor) <= 0){
        return res.status(400).json({ "mensagem": "O valor a depositar não pode ser negativo e deve ser maior que 0!" });
    }

    const contaParaRealizarODeposito = instituicao.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });

    if(!contaParaRealizarODeposito){
        return res.status(400).json({ "mensagem": "Conta não encontrada!"});
    }

    contaParaRealizarODeposito.saldo += Number(valor);

    instituicao.depositos.push({
        data: format(new Date, "yyyy-MM-dd h:m:s"),
        numero_conta,
        valor
    });

    return res.status(201).json();
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if(!senha) {
        return res.status(400).json({ "mensagem": "Senha não informada!" });
    }

    const contaExite = instituicao.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });

    if(!contaExite){
        return res.status(400).json({ "mensagem": "A conta informada não existe em nosso banco de dados!" });
    }

    if(contaExite.usuario.senha !== senha){
        return res.status(400).json({ "mensagem": "Senha inválida!" });
    }

    if(Number(valor) > contaExite.saldo){
        return res.status(400).json({ "mensagem": "Saldo indisponível!" });
    }

    contaExite.saldo -= Number(valor);

    instituicao.saques.push({
        data: format(new Date, "yyyy-MM-dd h:m:s"),
        numero_conta,
        valor
    });

    return res.status(204).json();
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if(!numero_conta_origem){
        return res.status(400).json({ "mensagem": "O número da conta deve ser informado!" });
    }

    if(!numero_conta_destino){
        return res.status(400).json({ "mensagem": "O número da conta deve ser informado!" });
    }

    if(!valor){
        return res.status(400).json({ "mensagem": "O valor a depositar deve ser informado!" });
    }

    if(!senha) {
        return res.status(400).json({ "mensagem": "Senha não informada!" });
    }

    const contaOrigem = instituicao.contas.find((conta) => {
        return conta.numero === Number(numero_conta_origem);
    });

    const contaDestino = instituicao.contas.find((conta) => {
        return conta.numero === Number(numero_conta_destino);
    });

    if(!contaOrigem){
        return res.status(400).json({ "mensagem": "A conta informada não existe em nosso banco de dados!" });
    }

    if(!contaDestino){
        return res.status(400).json({ "mensagem": "A conta informada não existe em nosso banco de dados!" });
    }

    if(contaOrigem.usuario.senha !== senha){
        return res.status(400).json({ "mensagem": "Senha inválida!" });
    }

    if(Number(valor) > contaOrigem.saldo){
        return res.status(400).json({ "mensagem": "Saldo indisponível!" });
    }

    contaOrigem.saldo -= Number(valor);

    contaDestino.saldo += Number(valor);

    instituicao.transferencias.push({
        data: format(new Date, "yyyy-MM-dd h:m:s"),
        numero_conta_origem,
        numero_conta_destino,
        valor
    });

    return res.status(204).json();
}

const mostrarSaldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if(!numero_conta){
        return res.status(400).json({ "mensagem": "O número da conta deve ser informado!" });
    }

    if(!senha) {
        return res.status(400).json({ "mensagem": "Senha não informada!" });
    }

    const contaExite = instituicao.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });

    if(!contaExite){
        return res.status(400).json({ "mensagem": "A conta informada não existe em nosso banco de dados!" });
    }

    if(contaExite.usuario.senha !== senha){
        return res.status(400).json({ "mensagem": "Senha inválida!" });
    }

    return res.status(200).json({ "saldo": contaExite.saldo});
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if(!numero_conta){
        return res.status(400).json({ "mensagem": "O número da conta deve ser informado!" });
    }

    if(!senha) {
        return res.status(400).json({ "mensagem": "Senha não informada!" });
    }

    const contaExite = instituicao.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });

    if(!contaExite){
        return res.status(400).json({ "mensagem": "A conta informada não existe em nosso banco de dados!" });
    }

    if(contaExite.usuario.senha !== senha){
        return res.status(400).json({ "mensagem": "Senha inválida!" });
    }

    const depositos = instituicao.depositos.filter((deposito) => {
        return deposito.numero_conta === numero_conta;
    });

    const saques = instituicao.saques.filter((saque) => {
        return saque.numero_conta === numero_conta;
    });

    const transferenciasRecebidas = instituicao.transferencias.filter((transferencia) => {
        return transferencia.numero_conta_destino === numero_conta;
    });

    const transferenciasEnviadas = instituicao.transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem === numero_conta;
    });

    const extrato = {
        depositos,
        saques,
        transferenciasEnviadas,
        transferenciasRecebidas
    }

    return res.status(200).json(extrato);
}

module.exports = {
    listar,
    criarConta,
    atualizarConta,
    deletarConta,
    depositar,
    sacar,
    transferir,
    mostrarSaldo,
    extrato
}