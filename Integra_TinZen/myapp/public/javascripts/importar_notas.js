document.addEventListener('DOMContentLoaded', function () {
    const importButton = document.getElementById('importButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    importButton.addEventListener('click', function () {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        const numeroNota = document.getElementById('numeroNota').value;

        if (!numeroNota) {
            errorMessage.textContent = 'Número Nota Fiscal não pode estar vazio.';
            errorMessage.style.display = 'block';
            return;
        }

        let dado = { NUMERONF: numeroNota };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dado)
        };

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
