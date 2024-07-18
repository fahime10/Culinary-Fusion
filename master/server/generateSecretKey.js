const crypto = require('crypto');

const SECRET_KEY = crypto.randomBytes(64).toString('hex');

console.log('JWT secret key generated: ', SECRET_KEY);