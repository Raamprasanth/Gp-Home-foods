const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// ══ EMPLOYEE ROUTES ══

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create an employee
router.post('/', async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an employee
router.put('/:id', async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json(updatedEmployee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ══ ATTENDANCE ROUTES ══

// Get all attendance data (format it for frontend: { "YYYY-MM-DD": { empId: "P" } })
router.get('/attendance/all', async (req, res) => {
    try {
        const attendances = await Attendance.find();
        const formatted = {};
        attendances.forEach(att => {
            const recordsObj = {};
            if (att.records) {
                att.records.forEach((value, key) => {
                    recordsObj[key] = value;
                });
            }
            formatted[att.date] = recordsObj;
        });
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update attendance for a specific date and employee
router.post('/attendance/mark', async (req, res) => {
    try {
        const { date, empId, status } = req.body;
        if (!date || !empId || !status) {
            return res.status(400).json({ message: 'Missing date, empId, or status' });
        }

        let attRecord = await Attendance.findOne({ date });
        if (!attRecord) {
            attRecord = new Attendance({ date, records: {} });
        }
        
        attRecord.records.set(empId, status);
        await attRecord.save();
        
        res.json({ message: 'Attendance updated', record: Object.fromEntries(attRecord.records) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark all attendance for a specific date
router.post('/attendance/mark-all', async (req, res) => {
    try {
        const { date, status, employeeIds } = req.body;
        if (!date || !status || !employeeIds || !Array.isArray(employeeIds)) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        let attRecord = await Attendance.findOne({ date });
        if (!attRecord) {
            attRecord = new Attendance({ date, records: {} });
        }
        
        employeeIds.forEach(empId => {
            attRecord.records.set(empId, status);
        });
        
        await attRecord.save();
        
        res.json({ message: 'All attendance updated', record: Object.fromEntries(attRecord.records) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
