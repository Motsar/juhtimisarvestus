const mongoose = require('mongoose');

module.exports = mongoose.model('User', mongoose.Schema({
    firstName: { type: 'String', required: true, min: 2, max: 100 },
    lastName: { type: 'String', required: true, min: 2, max: 100 },
    googleId: { type: 'String', required: false},
    email: { type: 'String',unique: true, required: true },
    password: { type: 'String', required: function(){return this.googleId === undefined;}, minLength: 8},
}));




