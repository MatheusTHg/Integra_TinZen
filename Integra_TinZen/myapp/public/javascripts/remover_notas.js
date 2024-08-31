document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('removeButton').addEventListener('click', function() {
        const selectedNotas = [];

        // Captura os checkboxes selecionados
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(function(checkbox) {
            const notaNumero = checkbox.value; // Captura o valor do checkbox (Número da nota fiscal)
            selectedNotas.push(notaNumero);
        });

        if (selectedNotas.length === 0) {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = 'Por favor, selecione ao menos uma nota fiscal para remover.';
                errorMessage.style.display = 'block';
            }
            return;
        }

        // Envia a solicitação de remoção ao servidor
        fetch('/notas', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notasNumeros: selectedNotas })
        })
        .then(response => response.json())
        .then(data => {
            const successMessage = document.getElementById('successRemove');
            const errorMessage = document.getElementById('errorRemove');

            if (data.message) {
                if (successMessage) {
                    successMessage.textContent = data.message;
                    successMessage.style.display = 'block';
                }

                // Adiciona um delay de 3 segundos antes de recarregar a página
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                throw new Error('Erro ao remover as notas fiscais.');
            }
        })
        .catch(error => {
            const errorMessage = document.getElementById('errorRemove');
            if (errorMessage) {
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            }
        });
    });
});
