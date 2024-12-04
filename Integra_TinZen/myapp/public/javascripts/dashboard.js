document.addEventListener("DOMContentLoaded", function () {
    const ctxNotasImportadas = document.getElementById("notasImportadasChart").getContext("2d");
    new Chart(ctxNotasImportadas, {
      type: "bar",
      data: {
        labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"],  
        datasets: [{
          label: "Notas Fiscais Importadas",
          data: [15, 22, 30, 10, 45], 
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  
    const ctxDadosSimbolicos = document.getElementById("dadosSimbolicosChart").getContext("2d");
    new Chart(ctxDadosSimbolicos, {
      type: "pie",
      data: {
        labels: ["Categoria A", "Categoria B", "Categoria C"],
        datasets: [{
          label: "Distribuição Simbólica",
          data: [40, 25, 35],  
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)"
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)"
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  
    const ctxTrendLine = document.getElementById("trendLineChart").getContext("2d");
    new Chart(ctxTrendLine, {
      type: "line",
      data: {
        labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"],  
        datasets: [{
          label: "Tendência de Exportação",
          data: [12, 19, 3, 5, 2],  
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    const ctxRadar = document.getElementById("radarChart").getContext("2d");
    new Chart(ctxRadar, {
      type: "radar",
      data: {
        labels: ["Categoria A", "Categoria B", "Categoria C", "Categoria D"],
        datasets: [{
          label: "Comparação de Performance",
          data: [20, 10, 4, 8],
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  });
  