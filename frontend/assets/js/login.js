document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Cria ou captura uma tag para exibir mensagens de erro na tela de login
    let errorEl = document.getElementById('loginError');
    if (!errorEl && loginForm) {
        errorEl = document.createElement('p');
        errorEl.id = 'loginError';
        errorEl.style.color = '#ef4444';
        errorEl.style.fontSize = '14px';
        errorEl.style.marginTop = '12px';
        errorEl.style.textAlign = 'center';
        errorEl.style.fontWeight = '500';
        loginForm.appendChild(errorEl);
    }

    // ALTERADO: Agora aponta para o IP da sua máquina para o celular também conseguir acessar
    const API_URL = 'http://192.168.3.14:3000/api/auth/login';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        errorEl.innerText = ''; // Limpa mensagens de erro anteriores

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            // Envia os dados para a nossa API do Node
            const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json' // Deixe apenas esta linha dentro de headers
    },
    body: JSON.stringify({ email, password })
});

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao tentar realizar o login.');
            }

            // --- SUCESSO CORRIGIDO ---
            // Mantém apenas o seu padrão oficial de chaves
            localStorage.setItem('@ColdMonitor:token', data.token);
            localStorage.setItem('@ColdMonitor:user', JSON.stringify(data.user));

            // Redireciona uma única vez para o Dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Erro na autenticação:', error);
            errorEl.innerText = error.message;
        }
    });
});