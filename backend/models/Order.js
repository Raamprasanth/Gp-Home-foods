const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: { type: String, required: true }, // snapshot of the name
    price: { type: Number, required: true }, // snapshot of the price at order time
    quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['dine-in', 'delivery', 'takeaway'], required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'cancelled', 'on-the-way', 'delivered'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
