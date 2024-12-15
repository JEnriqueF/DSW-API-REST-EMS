const jwt = require('jsonwebtoken');

// Verificar JWT
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1]

    if (!token) {
        return res.status(403).json({ error: 'Se requiere un token' });
    }

    console.log(process.env.JWT_SECRET)
    console.log(token)
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' , token: token});
    }
};

module.exports = {
    verificarToken,
};
