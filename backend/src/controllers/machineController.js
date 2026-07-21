import { getDatabaseConnection } from '../config/db.js';

// Listar todas as máquinas (GET)
export const getAllMachines = async (req, res) => {
    try {
        const db = await getDatabaseConnection();
        const machines = await db.all('SELECT * FROM machines');
        
        // O SQLite salva textos, então precisamos converter a string do histórico de volta para Array
        const formattedMachines = machines.map(m => ({
            ...m,
            history: JSON.parse(m.history)
        }));

        res.status(200).json(formattedMachines);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar máquinas no banco.', error: error.message });
    }
};

// Buscar uma máquina específica por ID (GET)
export const getMachineById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getDatabaseConnection();
        const machine = await db.get('SELECT * FROM machines WHERE id = ?', [id]);

        if (!machine) {
            return res.status(404).json({ message: 'Câmara fria não encontrada.' });
        }

        machine.history = JSON.parse(machine.history);
        res.status(200).json(machine);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar detalhes da máquina.', error: error.message });
    }
};

// Adicionar uma nova máquina (POST)
export const createMachine = async (req, res) => {
    try {
        const { name, location, target } = req.body;

        if (!name || !location || target === undefined) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const db = await getDatabaseConnection();
        
        const temp = target;
        const status = 'ok';
        // Salvamos o histórico inicial como uma string JSON
        const history = JSON.stringify([target]); 

        const result = await db.run(
            `INSERT INTO machines (name, location, temp, target, status, history) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, location, temp, target, status, history]
        );

        const newMachine = {
            id: result.lastID,
            name,
            location,
            temp,
            target,
            status,
            history: [target]
        };

        res.status(201).json(newMachine);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar máquina no banco.', error: error.message });
    }
};