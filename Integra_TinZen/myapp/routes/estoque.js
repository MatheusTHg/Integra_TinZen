const express = require('express');
const router = express.Router();
const axios = require('axios');

async function obterEstoque(id) {
  const url = 'https://api.tiny.com.br/api2/produto.obter.estoque.php';
  const token = ''; // Substitua pela sua chave de API
  const formato = 'JSON';

  try {
    console.log(`Enviando requisição para obter estoque com ID: ${id}`);
    
    const data = new URLSearchParams({
      token: token,
      id: id,
      formato: formato,
    }).toString();

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    console.log('Resposta da API:', response.data);

    // Inspeciona a estrutura dos dados da resposta
    const dados = response.data;

    // Ajuste a verificação conforme a estrutura real da resposta
    if (dados.retorno && dados.retorno.produto) {
      return {
        produtos: [{
          saldo: dados.retorno.produto.saldo,
          id: id
        }],
        mensagem: null
      };
    } else {
      throw new Error('Dados de estoque não encontrados na resposta.');
    }
  } catch (error) {
    console.error('Erro na requisição para a API da Tiny:', error.response ? error.response.data : error.message);
    throw new Error('Erro ao consultar o estoque da API.');
  }
}

// Rota para consultar estoque
router.get('/', async function (req, res, next) {
  const id = req.query.id;

  console.log('ID recebido:', id);

  if (!id) {
    return res.render('estoque', {
      title: 'Integra TinZen - Estoque',
      resultadoBusca: { produtos: [], mensagem: 'ID não fornecido' },
    });
  }

  try {
    const resultadoBusca = await obterEstoque(id); // Chama a função para obter o estoque
    console.log('Resultado da busca:', resultadoBusca);
    res.render('estoque', {
      title: 'Integra TinZen - Estoque',
      resultadoBusca, // Passa a lista de produtos para o Pug
    });
  } catch (error) {
    console.error('Erro ao obter o saldo:', error.message);
    res.render('estoque', {
      title: 'Integra TinZen - Estoque',
      resultadoBusca: { produtos: [], mensagem: 'Erro ao buscar' }, // Passa um erro amigável para o Pug
    });
  }
});

module.exports = router;
