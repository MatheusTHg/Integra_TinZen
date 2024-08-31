document.addEventListener('DOMContentLoaded', function () {
    const importButton = document.getElementById('importButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    importButton.addEventListener('click', function () {
        // Limpar mensagens anteriores
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        // Obter o valor do campo "Número Nota Fiscal"
        const numeroNota = document.getElementById('numeroNota').value;

        // Verificar se o valor está vazio
        if (!numeroNota) {
            errorMessage.textContent = 'Número Nota Fiscal não pode estar vazio.';
            errorMessage.style.display = 'block';
            return;
        }

        // Criar um objeto com os dados a serem enviados para o servidor
        let dado = { NUMERONF: numeroNota };

        // Configurar as opções da requisição AJAX
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dado)
        };

        // Enviar a requisição AJAX para o backend
        fetch('/importarNotas', options)
            .then(response => response.json())
            .then(dado => {
                if (dado.error) {
                    errorMessage.textContent = dado.error;
                    errorMessage.style.display = 'block';
                } else {
                    successMessage.textContent = dado.message;
                    successMessage.style.display = 'block';
                    console.log('Resposta do servidor:', dado);
                    // Faça algo com a resposta do servidor, se necessário
                }
                setTimeout(() => {
                    location.reload();
                }, 2000);
            })
            .catch(error => {
                errorMessage.textContent = 'Erro ao enviar dados para o servidor: ' + error.message;
                errorMessage.style.display = 'block';
                console.error('Erro ao enviar dados para o servidor:', error);
            });
    });
});
