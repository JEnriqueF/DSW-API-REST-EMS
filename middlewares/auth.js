const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const { generaToken } = require('../services/jwttoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Se requiere un token válido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const tokenDecodificado = jwt.verify(token, jwtSecret);
        req.tokenDecodificado = tokenDecodificado;

        const minutosRestantes = (tokenDecodificado.exp - Date.now() / 1000) / 60;

        if (minutosRestantes < 5) {
            const payload = tokenDecodificado; 
            const nuevoToken = generaToken(payload);

            res.setHeader('Set-Authorization', `Bearer ${nuevoToken}`);
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'El token ha expirado. Por favor, inicie sesión nuevamente.' });
        }
        return res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = {
    verificarToken,
};
