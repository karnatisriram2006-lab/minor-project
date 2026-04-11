const express = require('express');
const router = express.Router();
const { 
    optimizeBudget, 
    saveBudgetToTrip, 
    addExpense, 
    getTripBudgetSummary, 
    deleteExpense 
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.post('/optimize', optimizeBudget);
router.post('/save-target', protect, saveBudgetToTrip);
router.post('/expense', protect, addExpense);
router.get('/trip/:tripId', /* protect, */ getTripBudgetSummary);
router.delete('/expense/:id', protect, deleteExpense);

module.exports = router;
