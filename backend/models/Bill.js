const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    emoji: { type: String },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
});

const billSchema = new mongoose.Schema({
    billNo: { type: Number, required: true, unique: true },
    customer: { type: String, default: 'Walk-in' },
    table: { type: String, default: '—' },
    items: [billItemSchema],
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    total: { type: Number, required: true },
    payMethod: { type: String, enum: ['cash', 'upi', 'split'], required: true },
    splitCash: { type: Number },
    splitUpi: { type: Number },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
