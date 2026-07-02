const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    employeeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true 
    },
    month: { 
        type: String, 
        required: true // Format: YYYY-MM
    },
    baseSalary: { 
        type: Number, 
        required: true 
    },
    bonus: { 
        type: Number, 
        default: 0 
    },
    deductions: { 
        type: Number, 
        default: 0 
    },
    netSalary: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Paid'], 
        default: 'Pending' 
    },
    paymentDate: { 
        type: Date 
    }
}, { timestamps: true });

// Ensure virtual 'id' is included when sending to frontend
salarySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

module.exports = mongoose.model('Salary', salarySchema);
