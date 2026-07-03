const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: { 
        type: String, 
        required: true,
        unique: true // Ensure only one record per date like 'YYYY-MM-DD'
    },
    records: {
        type: Map,
        of: String, // Maps employeeId -> "P", "A", or "L"
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
