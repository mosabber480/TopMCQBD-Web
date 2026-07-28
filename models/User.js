const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'customer'],
        default: 'customer'
    },
    // --- ফিক্স: requestedPlan কে subscription এর বাইরে (রুট লেভেলে) রাখা হলো ---
    requestedPlan: {
        type: String,
        enum: ['none', '1_month', '3_months', '6_months', '1_year', '2_years', '3_years'],
        default: 'none'
    },
    // ----------------------------------------------------------------------
    subscription: {
        plan: {
            type: String,
            enum: ['none', '1_month', '3_months', '6_months', '1_year', '2_years', '3_years'],
            default: 'none'
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        active: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);