const express = require('express');
const router = express.Router();
const { savePrediction, getPrediction, getPredictionByUserId, updateLoanStatus } = require('../controllers/predictionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

router.post('/save-prediction', authMiddleware, savePrediction);
router.get('/get-loan', getPrediction);
router.get('/get-loans/user/:userId',  getPredictionByUserId);
router.patch('/update-loan-status/:id', authMiddleware, roleCheck(true), updateLoanStatus);

module.exports = router;
