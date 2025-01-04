const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const generaToken = (payload, expiresIn = '2h') => {
    return jwt.sign(payload, jwtSecret, { expiresIn });
};

const tiempoRestanteToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtSecret);
        const tiempoRestante = decoded.exp - Math.floor(Date.now() / 1000);
        return Math.max(0, tiempoRestante);
    } catch {
        return 0;
    }
};

module.exports = { generaToken, tiempoRestanteToken };