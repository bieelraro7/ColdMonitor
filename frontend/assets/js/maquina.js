// VERIFICAÇÃO DE SEGURANÇA: Redireciona para o login se o token não existir
const token = localStorage.getItem('@ColdMonitor:token');
if (!token) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const machineId = parseInt(urlParams.get('id'));

    if (!machineId) {
        alert('Câmara não especificada.');
        window.location.href = 'dashboard.html';
        return;
    }

    const API_URL = `http://localhost:3000/api/machines/${machineId}`;
    
    const machineNameEl = document.getElementById('machineName');
    const machineLocationEl = document.getElementById('machineLocation');
    const targetTempEl = document.getElementById('targetTemp');
    const currentTempEl = document.getElementById('currentTemp');
    const statusEl = document.getElementById('machineStatus');
    const ctx = document.getElementById('tempChart').getContext('2d');
    
    let tempChart;

    // --- BUSCAR DADOS DA MÁQUINA ESPECÍFICA (GET) ---
    async function fetchMachineDetails() {
        try {
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}` // Envia o token para autorizar a leitura do histórico
                }
            });
            
            if (!response.ok) {
                throw new Error('Câmara fria não encontrada no servidor.');
            }

            const machine = await response.json();

            machineNameEl.innerText = machine.name;
            machineLocationEl.innerHTML = `<i class="ph ph-map-pin"></i> ${machine.location}`;
            targetTempEl.innerText = `${machine.target.toFixed(1)}°C`;
            currentTempEl.innerText = `${machine.temp.toFixed(1)}°C`;

            if (machine.status === 'ok') {
                statusEl.innerText = 'Operando';
                statusEl.className = 'status-badge status-ok';
            } else {
                statusEl.innerText = 'Atenção';
                statusEl.className = 'status-badge status-alert';
            }

            renderChart(machine.history, machine.status);

        } catch (error) {
            console.error('Erro:', error);
            machineNameEl.innerText = 'Erro ao carregar dados';
            alert('Não foi possível obter os detalhes desta câmara do servidor.');
        }
    }

    // --- FUNÇÃO PARA GERAR O GRÁFICO (CHART.JS) ---
    function renderChart(historyData, status) {
        const labels = historyData.map((_, index) => `Leit. ${index + 1}`);

        if (tempChart) {
            tempChart.destroy(); // Evita bugs de sobreposição ao recarregar o gráfico
        }

        tempChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatura Registrada (°C)',
                    data: historyData,
                    borderColor: status === 'ok' ? '#2563eb' : '#ef4444', 
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    borderWidth: 3,
                    tension: 0.3, 
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: '#f3f4f6' },
                        ticks: { callback: value => Number(value).toFixed(1) + '°C' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    fetchMachineDetails();

    setInterval(fetchMachineDetails, 5000); // Atualiza os dados a cada 5 segundos
});