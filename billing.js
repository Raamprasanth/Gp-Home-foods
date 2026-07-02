const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Get all bills
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find().sort({ date: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new bill
router.post('/', async (req, res) => {
    try {
        let billNo = req.body.billNo;
        if (!billNo) {
            const lastBill = await Bill.findOne().sort({ billNo: -1 });
            billNo = lastBill && lastBill.billNo ? lastBill.billNo + 1 : 1;
        }

        const newBill = new Bill({
            ...req.body,
            billNo
        });

        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get a specific bill
router.get('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
