const express = require('express');
const router = express.Router();
const Revenue = require('../models/Revenue');
const Bill = require('../models/Bill'); // Using Bill model to fetch dynamic revenue data

// GET /api/revenue
// Fetches all daily revenue summary records
router.get('/', async (req, res) => {
    try {
        const revenues = await Revenue.find({}).sort({ date: -1 });
        res.status(200).json(revenues);
    } catch (error) {
        console.error('Error fetching revenues:', error);
        res.status(500).json({ error: 'Failed to fetch revenues' });
    }
});

// GET /api/revenue/summary
// Dynamically calculates current revenue from Bills
router.get('/summary', async (req, res) => {
    try {
        const bills = await Bill.find({});
        const totalRevenue = bills.reduce((sum, b) => sum + (b.total || 0), 0);
        const totalBills = bills.length;
        
        let cashTotal = 0;
        let upiTotal = 0;
        let splitCount = 0;
        
        bills.forEach(b => {
            if (b.payMethod === 'cash') cashTotal += b.total;
            if (b.payMethod === 'upi') upiTotal += b.total;
            if (b.payMethod === 'split') {
                cashTotal += (b.splitCash || 0);
                upiTotal += (b.splitUpi || 0);
                splitCount++;
            }
        });

        res.status(200).json({ 
            totalRevenue, 
            totalBills, 
            cashTotal, 
            upiTotal,
            splitCount,
            recentBills: bills.slice(-10).reverse() 
        });
    } catch (error) {
        console.error('Error fetching revenue summary:', error);
        res.status(500).json({ error: 'Failed to fetch revenue summary' });
    }
});

// POST /api/revenue
// Creates a new daily revenue summary record
router.post('/', async (req, res) => {
    try {
        const newRevenue = new Revenue(req.body);
        const savedRevenue = await newRevenue.save();
        res.status(201).json(savedRevenue);
    } catch (error) {
        console.error('Error creating revenue:', error);
        res.status(400).json({ error: 'Failed to create revenue' });
    }
});

module.exports = router;
