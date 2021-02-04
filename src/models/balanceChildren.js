const mongoose = require('mongoose');
const {Schema} = require('mongoose');

module.exports = mongoose.model ('balanceChildren',{
    date: {type: Date, required: true},
    mingiNumber1: {type: Number, required: true},
    mingiNumber2: {type: Number, required: true},
    mingiNumber3: {type: Number, required: true}
});
