/* This JavaScript code defines three functions related to handling predictions and loans data. Here is
a breakdown of what each part of the code does: */
const Prediction = require('../models/predictionModel');
const Loan = require('../models/predictionModel')
const HttpError = require('../models/errorModel')

const savePrediction = async (req, res) => {
    try {
        const predictionData = req.body;
        const newPrediction = new Prediction({
            ...predictionData,
            user: req.user.id // Đảm bảo rằng _id được lấy đúng từ req.user
        });

        await newPrediction.save();
        res.status(201).json({ message: 'Prediction saved successfully!',newPrediction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



const getPrediction = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        const loans = await Loan.find()
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit)
            .populate('user', 'name email avatar'); // Thêm 'name' để populate tên người dùng
        
        const totalLoans = await Loan.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastMonthLoans = await Loan.countDocuments({ createdAt: { $gte: oneMonthAgo } });

        res.status(200).json({
            loans,
            totalLoans,
            lastMonthLoans,
        });

    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

const getPredictionByUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        const loans = await Loan.find({ user: userId })
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit)
            .populate('user', 'name email avatar');

        const totalLoans = await Loan.countDocuments({ user: userId });
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastMonthLoans = await Loan.countDocuments({ user: userId, createdAt: { $gte: oneMonthAgo } });

        res.status(200).json({
            loans,
            totalLoans,
            lastMonthLoans,
        });

    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};


const updateLoanStatus = async (req, res, next) => {
    try {
        const loanId = req.params.id;
        const { loan_status } = req.body;

        const loan = await Loan.findById(loanId);

        if (!loan) {
            return next(new HttpError('Loan not found', 404));
        }

        loan.loan_status = loan_status;
        await loan.save();

        res.status(200).json({ message: 'Loan status updated successfully!', loan });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

module.exports = {
    savePrediction,
    getPrediction,
    getPredictionByUserId,
    updateLoanStatus
};
