const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');

// Get all salary records
router.get('/', async (req, res) => {
    try {
        const salaries = await Salary.find().populate('employeeId', 'name role').sort({ createdAt: -1 });
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get salary records for a specific employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const salaries = await Salary.find({ employeeId: req.params.employeeId }).sort({ createdAt: -1 });
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a salary record
router.post('/', async (req, res) => {
    try {
        // Calculate net salary if not provided
        if (req.body.netSalary === undefined) {
            const baseSalary = req.body.baseSalary || 0;
            const bonus = req.body.bonus || 0;
            const deductions = req.body.deductions || 0;
            req.body.netSalary = baseSalary + bonus - deductions;
        }

        const newSalary = new Salary(req.body);
        const savedSalary = await newSalary.save();
        res.status(201).json(savedSalary);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a salary record
router.put('/:id', async (req, res) => {
    try {
        // Recalculate net salary if components are updated
        if (req.body.baseSalary !== undefined || req.body.bonus !== undefined || req.body.deductions !== undefined) {
            const currentSalary = await Salary.findById(req.params.id);
            if (currentSalary) {
                const baseSalary = req.body.baseSalary !== undefined ? req.body.baseSalary : currentSalary.baseSalary;
                const bonus = req.body.bonus !== undefined ? req.body.bonus : currentSalary.bonus;
                const deductions = req.body.deductions !== undefined ? req.body.deductions : currentSalary.deductions;
                req.body.netSalary = baseSalary + bonus - deductions;
            }
        }

        const updatedSalary = await Salary.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSalary) return res.status(404).json({ message: 'Salary record not found' });
        res.json(updatedSalary);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a salary record
router.delete('/:id', async (req, res) => {
    try {
        const salary = await Salary.findByIdAndDelete(req.params.id);
        if (!salary) return res.status(404).json({ message: 'Salary record not found' });
        res.json({ message: 'Salary record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
