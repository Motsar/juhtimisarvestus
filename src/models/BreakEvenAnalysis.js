const mongoose = require('mongoose');

module.exports = mongoose.model('breakEvenAnalysis', {
    salesTurnover:{ type : Array , "default" : [] },
    expenses:{ type : Array , "default" : [] }
})