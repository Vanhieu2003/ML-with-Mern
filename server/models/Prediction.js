const { Schema,model} = require('mongoose')

const PredictionSchema = new Schema ({
    loan_amnt: Number,
    term: Number,
    int_rate: Number,
    installment: Number,
    sub_grade: String,
    emp_length: Number,
    home_ownership: String,
    annual_inc: Number,
    verification_status: String,
    fico_score: Number,
    delinq_2yrs: Number,
    purpose: String,
    dti: Number,
    open_acc: Number,
    pub_rec: Number,
    pub_rec_bankruptcies: Number,
    revol_bal: Number,
    revol_util: Number,
    total_acc: Number,
    prediction: String,
    user_id: {type: Schema.Types.ObjectId,ref:"User" } // Assuming you have a User model
}, { timestamps: true });

module.exports = model('Prediction', PredictionSchema);
