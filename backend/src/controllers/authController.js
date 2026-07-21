import { getDatabaseConnection } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'sua_chave_secreta_e_segura_aqui'; // Em produção, use variáveis de ambiente

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        const db = await getDatabaseConnection();
        // Busca o usuário pelo e-mail
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // Compara a senha digitada com a senha criptografada do banco
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // Gera o token de acesso que expira em 2 horas
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        // Retorna os dados necessários para o frontend
        res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            user: { name: user.name, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor durante o login.', error: error.message });
    }
};