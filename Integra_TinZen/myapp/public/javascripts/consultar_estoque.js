$(document).ready(function() {
    $('form').on('submit', function(event) {
      event.preventDefault(); // Evita o envio padrão do formulário
  
      const id = $('input[name="id"]').val(); // Obtém o valor do campo ID
  
      $.ajax({
        url: '/estoque',
        method: 'GET',
        data: { id: id },
        success: function(response) {
          // Atualiza o conteúdo da página com a resposta
          $('.bottom-section').html(response);
        },
        error: function(xhr, status, error) {
          // Exibe uma mensagem de erro em caso de falha
          $('.bottom-section').html('<p>Erro ao buscar as informações de estoque.</p>');
        }
      });
    });
  });
  