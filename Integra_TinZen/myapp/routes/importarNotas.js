const express = require("express");
const router = express.Router();
const axios = require("axios");
const mysql = require("mysql2/promise");

const urlPesquisa = "https://api.tiny.com.br/api2/notas.fiscais.pesquisa.php";
const token = ""; // Insira o token da API aqui
const urlObter = "https://api.tiny.com.br/api2/nota.fiscal.obter.php";

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "integratz",
};

// Configuração da conexão com o banco de dados
const connection = mysql.createPool(dbConfig);

router.post("/", async (req, res) => {
  const { NUMERONF } = req.body;

  if (!NUMERONF) {
    return res.status(400).json({ error: "Número da Nota Fiscal é obrigatório" });
  }

  try {
    const dataPesquisa = `token=${token}&numero=${NUMERONF}&formato=JSON`;
    const response = await enviarREST(urlPesquisa, dataPesquisa);

    if (!response || !response.retorno || !response.retorno.notas_fiscais || response.retorno.notas_fiscais.length === 0) {
      return res.status(404).json({ error: "Nota fiscal não localizada" });
    }

    await processarResposta(response);

    res.status(200).json({ message: `Nota fiscal ${NUMERONF} importada com sucesso!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function enviarREST(url, data, optionalHeaders = null) {
  try {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (optionalHeaders) {
      Object.assign(headers, optionalHeaders);
    }

    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    throw new Error(`Problema com ${url}, ${error.message}`);
  }
}

async function salvarDadosNoBanco(detalhesNota, itens, transportadora) {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Verificar se a nota fiscal já existe no banco de dados
    const [existingNote] = await connection.execute(
      `SELECT * FROM notas_fiscais WHERE numero = ?`,
      [detalhesNota.numero]
    );

    if (existingNote.length > 0) {
      throw new Error(`Nota fiscal ${detalhesNota.numero} já importada.`);
    }

    // Iniciar uma transação para garantir a consistência dos dados
    await connection.beginTransaction();

    // Inserir os dados da nota fiscal na tabela 'notas_fiscais'
    const [resultNota] = await connection.execute(
      `INSERT INTO notas_fiscais 
            (numero, chave_acesso, situacao, descricao_situacao, serie, nome, data_emissao, transportadora) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        detalhesNota.numero || null,
        detalhesNota.chave_acesso || null,
        detalhesNota.situacao || null,
        detalhesNota.descricao_situacao || null,
        detalhesNota.serie || null,
        detalhesNota.nome || null,
        detalhesNota.data_emissao || null,
        transportadora || null,
      ]
    );

    const notaFiscalId = resultNota.insertId;

    // Inserir os itens da nota fiscal na tabela 'itens'
    for (const item of itens) {
      await connection.execute(
        `INSERT INTO itens 
                (nota_fiscal_id, codigo, descricao, unidade, quantidade) 
                VALUES (?, ?, ?, ?, ?)`,
        [
          notaFiscalId,
          item.codigo || null,
          item.descricao || null,
          item.unidade || null,
          item.quantidade || null,
        ]
      );
    }

    // Commit da transação
    await connection.commit();
  } catch (error) {
    // Rollback em caso de erro
    if (connection) await connection.rollback();
    throw error; // Lançar o erro para ser capturado na chamada da função
  } finally {
    // Fechar a conexão
    if (connection) await connection.end();
  }
}

async function processarResposta(response) {
  if (!response || !response.retorno || !response.retorno.notas_fiscais) {
    // Se existir um erro detalhado na resposta, mostre-o
    if (response && response.retorno && response.retorno.erros) {
      throw new Error(`Erro na resposta da API: ${JSON.stringify(response.retorno.erros, null, 2)}`);
    }
    return;
  }

  const notasFiscais = response.retorno.notas_fiscais;

  for (const nota of notasFiscais) {
    const detalhesNota = nota.nota_fiscal;
    if (detalhesNota.serie === "1") {
      const id = detalhesNota.id;
      const dataObter = `token=${token}&id=${id}&formato=JSON`;

      try {
        const detalhesResposta = await enviarREST(urlObter, dataObter);
        const notaFiscalDetalhada = detalhesResposta.retorno.nota_fiscal;

        const itens = notaFiscalDetalhada.itens.map(
          (itemWrapper) => itemWrapper.item
        );
        const transportadora =
          notaFiscalDetalhada.transportador &&
          notaFiscalDetalhada.transportador.nome
            ? notaFiscalDetalhada.transportador.nome
            : "N/A";

        await salvarDadosNoBanco(notaFiscalDetalhada, itens, transportadora);
      } catch (error) {
        throw new Error(`Erro ao obter detalhes da nota fiscal ${detalhesNota.numero}: ${error.message}`);
      }
    }
  }
}

module.exports = router;