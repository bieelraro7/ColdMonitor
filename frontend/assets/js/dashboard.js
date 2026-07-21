document.addEventListener('DOMContentLoaded', () => {
    console.log("--- Diagnóstico do ColdMonitor Inicializado ---");

    // 1. Verificação de Segurança e Recuperação de Sessão
    const token = localStorage.getItem('@ColdMonitor:token');
    const userRaw = localStorage.getItem('@ColdMonitor:user');

    console.log("Token encontrado:", token ? "Sim" : "Não");
    console.log("Dados do usuário no localStorage:", userRaw);

    if (!token) {
        console.warn("Usuário sem token. Redirecionando para login.html");
        window.location.href = 'login.html';
        return;
    }

    // 2. Exibição do E-mail do Usuário no Topo
    const emailDisplay = document.getElementById('user-email-display');
    if (emailDisplay) {
        try {
            if (userRaw && userRaw !== "undefined") {
                const user = JSON.parse(userRaw);
                emailDisplay.textContent = user.email || user.username || "Conectado";
            } else {
                emailDisplay.textContent = "Conectado";
            }
        } catch (parseError) {
            console.error("Erro ao processar dados do usuário:", parseError);
            emailDisplay.textContent = "Conectado";
        }
    } else {
        console.error("Erro: Elemento 'user-email-display' não foi encontrado no HTML.");
    }

    // 3. Configuração do Botão de Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Saindo do sistema...");
            localStorage.removeItem('@ColdMonitor:token');
            localStorage.removeItem('@ColdMonitor:user');
            window.location.href = 'login.html';
        });
    } else {
        console.error("Erro: Botão 'btn-logout' não foi encontrado no HTML.");
    }

    // 4. Referências da Interface do Dashboard
    const machineGrid = document.getElementById('machineGrid');
    const addMachineBtn = document.getElementById('addMachineBtn');
    const addMachineModal = document.getElementById('addMachineModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addMachineForm = document.getElementById('addMachineForm');

    // API_URL atualizada para o IP da máquina
    const API_URL = 'http://192.168.3.14:3000/api/machines';
    let machines = [];

    // --- BUSCAR DADOS DO SERVIDOR (GET) ---
    async function fetchMachines() {
        try {
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar dados do servidor');
            }

            machines = await response.json();
            renderMachines();
        } catch (error) {
            console.error('Erro ao carregar câmaras:', error);
            if (machineGrid) {
                machineGrid.innerHTML = `
                    <p style="color: #ef4444; grid-column: 1/-1; text-align: center; font-weight: 500;">
                        Não foi possível conectar ao servidor ou sessão expirada.
                    </p>
                `;
            }
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
   function renderMachines() {
        if (!machineGrid) return;
        machineGrid.innerHTML = '';

        machines.forEach(machine => {
            const statusClass = machine.status === 'ok' ? 'status-ok' : 'status-alert';
            const statusText = machine.status === 'ok' ? 'Operando' : 'Atenção';

            const card = document.createElement('div');
            card.className = 'machine-card';

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">
                        <h3>${machine.name}</h3>
                        <p><i class="ph ph-map-pin"></i> ${machine.location}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-body">
                    <div class="temp-display">${machine.temp.toFixed(1)}°C</div>
                    <div class="temp-target">Alvo: ${machine.target.toFixed(1)}°C</div>
                </div>
                <div class="card-footer" style="display: flex; gap: 8px;">
                    <button class="btn-secondary" style="flex: 1;" onclick="viewDetails(${machine.id})">Detalhes</button>
                    <button class="btn-secondary" style="flex: 1; background-color: #f3f4f6;" onclick="editMachine(${machine.id})">Editar</button>
                    <button class="btn-secondary" style="flex: 1; background-color: #fee2e2; color: #ef4444; border-color: #fca5a5;" onclick="deleteMachine(${machine.id})">Excluir</button>
                </div>
            `;

            machineGrid.appendChild(card);
        });
    }

    // --- FUNÇÕES DO MODAL ---
    function openModal() {
        if (addMachineModal) addMachineModal.classList.add('active');
    }

    function closeModal() {
        if (addMachineModal) addMachineModal.classList.remove('active');
        if (addMachineForm) addMachineForm.reset();
    }

    if (addMachineBtn) addMachineBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (addMachineModal) {
        addMachineModal.addEventListener('click', (e) => {
            if (e.target === addMachineModal) closeModal();
        });
    }

    // --- ENVIAR DADOS PARA O SERVIDOR (POST) ---
    if (addMachineForm) {
        addMachineForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('machineName').value;
            const location = document.getElementById('machineLocation').value;
            const target = parseFloat(document.getElementById('machineTarget').value);

            const machineData = { name, location, target };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(machineData)
                });

                if (!response.ok) {
                    throw new Error('Erro ao salvar a nova câmara');
                }

                await fetchMachines();
                closeModal();

            } catch (error) {
                console.error('Erro ao cadastrar:', error);
                alert('Erro ao salvar a câmara fria no servidor.');
            }
        });
    }

    // Inicialização da busca e atualização periódica
    fetchMachines();
    setInterval(fetchMachines, 5000);
});

// Navegação global para detalhes da máquina
window.viewDetails = function(id) {
    window.location.href = `maquina.html?id=${id}`;
};

// Excluir câmara
window.deleteMachine = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta câmara fria?')) {
        return;
    }

    const token = localStorage.getItem('@ColdMonitor:token');
    try {
        const response = await fetch(`http://192.168.3.14:3000/api/machines/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir a câmara');
        }

        location.reload();
    } catch (error) {
        console.error('Erro:', error);
        alert('Não foi possível excluir a câmara.');
    }
};

// Editar câmara
window.editMachine = async function(id) {
    const token = localStorage.getItem('@ColdMonitor:token');
    
    // Busca os dados da câmara na lista carregada
    const machine = machines.find(m => m.id === id);
    if (!machine) return;

    const newName = prompt("Novo nome da câmara:", machine.name);
    if (newName === null) return;

    const newLocation = prompt("Nova localização:", machine.location);
    if (newLocation === null) return;

    const newTarget = prompt("Nova temperatura alvo (°C):", machine.target);
    if (newTarget === null) return;

    try {
        const response = await fetch(`http://192.168.3.14:3000/api/machines/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: newName,
                location: newLocation,
                target: parseFloat(newTarget)
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar a câmara');
        }

        location.reload();
    } catch (error) {
        console.error('Erro:', error);
        alert('Não foi possível atualizar a câmara.');
    }
};