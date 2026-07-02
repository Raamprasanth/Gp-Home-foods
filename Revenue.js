const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    totalRevenue: {
        type: Number,
        required: true,
        default: 0
    },
    cashTotal: {
        type: Number,
        default: 0
    },
    upiTotal: {
        type: Number,
        default: 0
    },
    totalBills: {
        type: Number,
        default: 0
    },
    splitCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Revenue', revenueSchema);
