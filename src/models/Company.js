const mongoose = require('mongoose');

let companySchema = new mongoose.Schema({
        user_id: { type: 'String', required: true, max:50 },
        compName: { type: 'String' ,unique: true , required: true, min: 2, max: 50 },
        regNum: { type: 'String', required: true, max:30 },
        address: { type: 'String', required: true ,max:100 },
        email: { type: 'String', required: true, max:50 },
        phone: { type: 'String', required: true, max:30 },
        vat_obligatory: { type: 'String', required: true, enum: ['no', 'yes'] },
        yearLength: {type: 'Number', required: true, enum: [360, 365]},
        analyse_date: {type: Date, required: true, default: Date.now},
        Profit_report_schema: {type: 'Number', required: true, enum: [1 , 2]},
        additional_info: {type: 'String', required: false, max:500},
        balance: { type: mongoose.Schema.Types.ObjectId, ref: 'Balance'}
    }
);

companySchema.method('transform', function() {
    var obj = this.toObject();

    //Rename fields
    obj.company_id = obj._id;
    delete obj._id;

    return obj;
});

module.exports = mongoose.model('Company', companySchema);