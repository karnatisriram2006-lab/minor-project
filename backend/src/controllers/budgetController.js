const Trip = require('../models/Trip');
const SavedTrip = require('../models/SavedTrip');
const Expense = require('../models/Expense');

// @desc    Optimize travel budget allocation (Public / Logic only)
const optimizeBudget = async (req, res) => {
    const { totalBudget } = req.body;
    if (!totalBudget || typeof totalBudget !== 'number') {
        return res.status(400).json({ message: 'Valid totalBudget is required' });
    }
    const allocation = {
        stay: Math.round(totalBudget * 0.40),
        food: Math.round(totalBudget * 0.20),
        transport: Math.round(totalBudget * 0.20),
        tickets: Math.round(totalBudget * 0.10),
        emergency: Math.round(totalBudget * 0.10),
        total: totalBudget
    };
    res.json({ allocation });
};

// @desc    Save budget allocation targets to a specific trip
const saveBudgetToTrip = async (req, res) => {
    const { tripId, allocation } = req.body;
    try {
        let trip = await Trip.findById(tripId);
        if (!trip) {
            trip = await SavedTrip.findById(tripId);
        }
        
        if (!trip) {
            console.warn(`[Budget Save] Trip NOT FOUND in database for id: ${tripId}`);
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Diagnostic log
        console.warn(`[Budget Save] User ${req.user?._id} attempting to save to Trip ${tripId} (Owner: ${trip.userId})`);

        // Strict check: Only allow if owner matches
        if (String(trip.userId) !== String(req.user?._id)) {
            console.error(`[Budget Save] Ownership Mismatch: Trip owner ${trip.userId} vs Request user ${req.user?._id}`);
            return res.status(403).json({ message: 'Unauthorized: You do not own this trip' }); 
        }

        trip.budgetAllocation = allocation;
        await trip.save();
        res.json({ message: 'Budget saved to trip', trip });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Log a new expense
const addExpense = async (req, res) => {
    const { tripId, amount, category, description, date } = req.body;
    try {
        let trip = await Trip.findById(tripId);
        if (!trip) {
            trip = await SavedTrip.findById(tripId);
        }
        
        if (!trip) {
            console.warn(`[Budget Expense] Trip NOT FOUND in database for id: ${tripId}`);
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Diagnostic log
        console.warn(`[Budget Expense] User ${req.user?._id} adding to Trip ${tripId} (Owner: ${trip.userId})`);

        // Strict check for diagnostics
        if (String(trip.userId) !== String(req.user?._id)) {
            console.error(`[Budget Expense] Ownership Mismatch: Trip owner ${trip.userId} vs Request user ${req.user?._id}`);
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const expense = await Expense.create({
            userId: req.user?._id || 'anonymous',
            tripId,
            amount,
            category,
            description,
            date: date || Date.now()
        });
        res.status(201).json(expense);
    } catch (err) {
        console.error('[Budget Expense Error]', err.message);
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get trip budget summary (Budget vs Actual)
const getTripBudgetSummary = async (req, res) => {
    const { tripId } = req.params;
    console.log(`[Budget] Fetching summary for trip: ${tripId}`);
    
    try {
        if (!require('mongoose').Types.ObjectId.isValid(tripId)) {
           console.warn(`[Budget] Invalid Trip ID Format: ${tripId}`);
           return res.status(400).json({ message: 'Invalid Trip ID format' });
        }

        let trip = await Trip.findById(tripId);
        if (!trip) {
            trip = await SavedTrip.findById(tripId);
        }
        
        if (!trip) {
            console.warn(`[Budget] Trip NOT FOUND in database for id: ${tripId}`);
            return res.status(404).json({ message: 'Trip not found' });
        }

        const expenses = await Expense.find({ tripId }).sort({ date: -1 });
        
        // Aggregate actual spend by category
        const actual = {
            stay: 0, food: 0, transport: 0, tickets: 0, emergency: 0, other: 0, total: 0
        };

        expenses.forEach(e => {
            actual[e.category] = (actual[e.category] || 0) + e.amount;
            actual.total += e.amount;
        });

        res.json({
            budgetAllocation: trip.budgetAllocation,
            actualSpend: actual,
            expenses
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete an expense entry
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        await expense.deleteOne();
        res.json({ message: 'Expense removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    optimizeBudget,
    saveBudgetToTrip,
    addExpense,
    getTripBudgetSummary,
    deleteExpense
};
