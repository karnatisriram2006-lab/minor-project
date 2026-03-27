const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_demo', {
        expiresIn: '30d',
    });
};

module.exports = generateToken;
