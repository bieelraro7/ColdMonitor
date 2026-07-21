import express from 'express';
import cors from 'cors';
import machineRoutes from './src/routes/machineRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import { startTemperatureSimulation } from './src/services/simulationService.js'; // Nova linha

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/machines', machineRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ColdMonitor rodando na porta http://localhost:${PORT}`);
    
    // Inicia o simulador automático de sensores
    startTemperatureSimulation(); // Nova linha
});