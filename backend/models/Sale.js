const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now },
    totalRevenue: { type: Number, required: true, default: 0 },
    totalOrders: { type: Number, required: true, default: 0 },
    cashRevenue: { type: Number, default: 0 },
    upiRevenue: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'closed' },
    notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
