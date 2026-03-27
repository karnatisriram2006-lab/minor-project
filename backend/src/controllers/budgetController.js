// @desc    Optimize travel budget
// @route   POST /api/budget/optimize
// @access  Public
const optimizeBudget = async (req, res) => {
    const { totalBudget } = req.body;

    if (!totalBudget || typeof totalBudget !== 'number') {
        return res.status(400).json({ message: 'Valid totalBudget is required' });
    }

    // Algorithm from requirements
    // Stay = 40%, Food = 20%, Transport = 20%, Tickets = 10%, Emergency = 10%
    const allocation = {
        stay: totalBudget * 0.40,
        food: totalBudget * 0.20,
        transport: totalBudget * 0.20,
        tickets: totalBudget * 0.10,
        emergency: totalBudget * 0.10,
        total: totalBudget
    };

    res.json({ allocation });
};

module.exports = {
    optimizeBudget
};
