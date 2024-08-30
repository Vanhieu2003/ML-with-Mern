const { Schema, model } = require('mongoose');

const PredictionSchema = new Schema({
  loan_amnt: Number,
  term: Number,
  int_rate: Number,
  installment: Number,
  grade: String,
  emp_length: Number,
  home_ownership: String,
  annual_inc: Number,
  verification_status: String,
  fico_score: Number,
  purpose: String,
  dti: Number,
  open_acc: Number,
  pub_rec: Number,
  pub_rec_bankruptcies: Number,
  revol_bal: Number,
  revol_util: Number,
  total_acc: Number,
  logistic_regression: {
    prediction: String,
    prediction_proba: [[Number]]
  },
  random_forest: {
    prediction: String,
    prediction_proba: [[Number]]
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' },  // Tham chiếu đến người dùng
  loan_status: { type: Boolean, default: false },  // Trạng thái khoản vay
}, { timestamps: true });

module.exports = model('Loan', PredictionSchema);
