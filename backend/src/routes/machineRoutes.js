import express from 'express';
import { getAllMachines, getMachineById, createMachine } from '../controllers/machineController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; // Nova linha

const router = express.Router();

// O 'verifyToken' age como um segurança da rota antes de executar a função final
router.get('/', verifyToken, getAllMachines);
router.get('/:id', verifyToken, getMachineById);
router.post('/', verifyToken, createMachine);

// --- ROTA PARA ATUALIZAR CÂMARA ---
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { name, location, target } = req.body;

    try {
        res.json({ message: `Câmara fria ${id} atualizada com sucesso!` });
    } catch (error) {
        console.error('Erro ao atualizar câmara:', error);
        res.status(500).json({ message: 'Erro ao atualizar a câmara fria.' });
    }
});

// --- ROTA PARA EXCLUIR CÂMARA ---

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        res.json({ message: `Câmara fria ${id} excluída com sucesso!` });
    } catch (error) {
        console.error('Erro ao excluir câmara:', error);
        res.status(500).json({ message: 'Erro ao excluir a câmara fria.' });
    }
});

export default router;