import jwt from 'jsonwebtoken';

const JWT_SECRET = 'sua_chave_secreta_e_segura_aqui'; // Deve ser a mesma chave do authController

export const verifyToken = (req, res, next) => {
    // Busca o token no cabeçalho 'Authorization' da requisição
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Remove a palavra 'Bearer'

    if (!token) {
        return res.status(403).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // Valida o token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Salva os dados do usuário logado na requisição para uso posterior
        next(); // Autoriza a requisição a seguir para o controlador
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};