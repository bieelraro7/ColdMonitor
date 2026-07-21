import { getDatabaseConnection } from '../config/db.js';

export function startTemperatureSimulation() {
    // Executa a cada 5000 milissegundos (5 segundos)
    setInterval(async () => {
        try {
            const db = await getDatabaseConnection();
            const machines = await db.all('SELECT * FROM machines');

            for (const machine of machines) {
                let history = JSON.parse(machine.history || '[]');

                // Gera uma oscilação aleatória entre -0.4°C e +0.4°C
                const change = (Math.random() * 0.8) - 0.4;
                let newTemp = machine.temp + change;

                // Força uma tendência de retorno se afastar demais do alvo
                if (newTemp > machine.target + 2) newTemp -= 0.3;
                if (newTemp < machine.target - 2) newTemp += 0.3;

                // Se a temperatura subir muito além do alvo, muda o status para alerta
                const status = (newTemp > machine.target + 2.5) ? 'alert' : 'ok';

                // Atualiza o histórico mantendo apenas as últimas 10 leituras
                history.push(parseFloat(newTemp.toFixed(1)));
                if (history.length > 10) {
                    history.shift();
                }

                // Grava as novas informações reais no banco de dados SQLite
                await db.run(
                    `UPDATE machines SET temp = ?, status = ?, history = ? WHERE id = ?`,
                    [parseFloat(newTemp.toFixed(1)), status, JSON.stringify(history), machine.id]
                );
            }
        } catch (error) {
            console.error('Erro na simulação de temperatura:', error.message);
        }
    }, 5000);
}