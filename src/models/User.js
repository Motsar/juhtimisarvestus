const mongoose = require('mongoose');

module.exports = mongoose.model('User', mongoose.Schema({
    firstName: { type: 'String', required: true, min: 2, max: 100 },
    lastName: { type: 'String', required: true, min: 2, max: 100 },
    googleId: { type: 'String', required: false},
    email: { type: 'String',unique: true, required: true },
    password: { type: 'String', required: function(){return this.googleId === undefined;}, minLength: 8},
    expiry_date: {type: Date,required: true},
    register_date: {type: Date, required: true, default: Date.now},
    last_login: {type: Date, default: Date.now},
    admin:{ type: 'Boolean', required: true, default: false}
}));