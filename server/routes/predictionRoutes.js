const express = require('express');
const router = express.Router();
const { savePrediction, getPrediction, getPredictionByUserId } = require('../controllers/predictionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/save-prediction', authMiddleware, savePrediction);
router.get('/get-loan', getPrediction);
router.get('/get-loans/user/:userId',  getPredictionByUserId);

module.exports = router;
