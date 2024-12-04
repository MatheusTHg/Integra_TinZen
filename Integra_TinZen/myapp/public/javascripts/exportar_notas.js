document.addEventListener('DOMContentLoaded', function () {
    const exportButton = document.getElementById('exportButton');
    const errorMessage = document.getElementById('errorMessageExport');
    const successMessage = document.getElementById('successMessageExport');

    if (!exportButton || !errorMessage || !successMessage) {
        console.error('Elementos necessários não encontrados no DOM.');
        return;
    }

    exportButton.addEventListener('click', async function () {
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';

        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const notasSelecionadas = Array.from(checkboxes).map(checkbox => ({
            numero: checkbox.value, 
            chave_acesso: checkbox.dataset.chave, 
        }));

        if (notasSelecionadas.length === 0) {
            if (errorMessage) {
                errorMessage.textContent = 'Por favor, selecione ao menos uma nota fiscal para exportar.';
                errorMessage.style.display = 'block';
            }
            return;
        }

        console.log('Notas selecionadas para exportação:', notasSelecionadas);

        try {
            const response = await fetch('/exportarNotas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notas: notasSelecionadas }), // Formato correto do JSON
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro do servidor:', errorText);
                throw new Error(`Erro no servidor: ${errorText}`);
            }

            const result = await response.json();
            console.log('Resposta do servidor:', result);

            if (successMessage) {
                successMessage.textContent = result.message || 'Exportação realizada com sucesso.';
                successMessage.style.display = 'block';
            }
        } catch (error) {
            if (errorMessage) {
                errorMessage.textContent = 'Erro ao exportar: ' + error.message;
                errorMessage.style.display = 'block';
            }
            console.error('Erro ao exportar:', error);
        }
    });
});
