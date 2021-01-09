const mongoose = require('mongoose');

module.exports = mongoose.model('User', mongoose.Schema({
    firstName: { type: 'String', required: true, min: 2, max: 100 },
    lastName: { type: 'String', required: true, min: 2, max: 100 },
    email: { type: 'String', required: true },
    password: { type: 'String', required: true, minLength: 8},
}));