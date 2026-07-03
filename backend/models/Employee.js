const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    joinDate: { type: String },
    salary: { type: Number },
    address: { type: String }
}, { timestamps: true });

// Ensure virtual 'id' is included when sending to frontend
employeeSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

module.exports = mongoose.model('Employee', employeeSchema);
