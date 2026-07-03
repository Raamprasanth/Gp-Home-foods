const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Bill = require('../models/Bill'); // Using Bill model to fetch dynamic sales data

// GET /api/sales
// Fetches all daily sale summary records
router.get('/', async (req, res) => {
    try {
        const sales = await Sale.find({}).sort({ date: -1 });
        res.status(200).json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

// GET /api/sales/summary
// Dynamically calculates current sales from Bills (Counts and Dish frequencies)
router.get('/summary', async (req, res) => {
    try {
        const bills = await Bill.find({});
        
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let billsToday = 0, billsWeek = 0, billsMonth = 0;
        let itemsToday = 0, itemsWeek = 0, itemsMonth = 0;
        
        const dishMap = {};

        bills.forEach(b => {
            const bDate = new Date(b.date);
            let itemsCount = 0;
            
            b.items.forEach(item => {
                itemsCount += item.qty;
                if (!dishMap[item.name]) {
                    dishMap[item.name] = { name: item.name, emoji: item.emoji || '🍲', count: 0 };
                }
                dishMap[item.name].count += item.qty;
            });

            if (bDate >= startOfDay) {
                billsToday++;
                itemsToday += itemsCount;
            }
            if (bDate >= startOfWeek) {
                billsWeek++;
                itemsWeek += itemsCount;
            }
            if (bDate >= startOfMonth) {
                billsMonth++;
                itemsMonth += itemsCount;
            }
        });

        const dishCounts = Object.values(dishMap).sort((a, b) => b.count - a.count);

        res.status(200).json({ 
            billsToday, billsWeek, billsMonth,
            itemsToday, itemsWeek, itemsMonth,
            dishCounts
        });
    } catch (error) {
        console.error('Error fetching sales summary:', error);
        res.status(500).json({ error: 'Failed to fetch sales summary' });
    }
});

// POST /api/sales
// Creates a new daily sale summary record
router.post('/', async (req, res) => {
    try {
        const newSale = new Sale(req.body);
        const savedSale = await newSale.save();
        res.status(201).json(savedSale);
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(400).json({ error: 'Failed to create sale' });
    }
});

module.exports = router;
