const mongoose = require('mongoose');

let companySchema = new mongoose.Schema({
        user_id: { type: 'String', required: true, max:50 },
        compName: { type: 'String', required: true, max: 100 },
        regNum: { type: 'String', required: true, max:30 },
        address: { type: 'String', required: true ,max:100 },
        comp_email: { type: 'String', required: true, max:50 },
        phone: { type: 'String', required: true, max:30 },
        vat_obligatory: { type: 'String', required: true, enum: ['no', 'yes'] },
        yearLength: {type: 'Number', required: true, enum: [360, 365]},
        analyse_date: {type: Date, required: true, default: Date.now},
        Profit_report_schema: {type: 'Number', required: true, enum: [1 , 2]},
        additional_info: {type: 'String', required: false, max:500}
    }
);


module.exports = mongoose.model('Company', companySchema);