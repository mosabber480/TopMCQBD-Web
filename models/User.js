const mongoose = require('mongoose');

// একটা একটা Pending Request-এর Schema (একাধিক request একসাথে থাকতে পারবে)
const PendingRequestSchema = new mongoose.Schema({
    plan: {
        type: String,
        enum: ['1_month', '3_months', '6_months', '1_year', '2_years', '3_years'],
        required: true
    },
    // 'new'   -> কোনো active/pending প্ল্যান ছাড়াই প্রথম রিকোয়েস্ট
    // 'add'   -> আগের pending request-এর সাথে আরেকটা যোগ (approve হলে duration স্ট্যাক হবে)
    // 'renew' -> Active subscription-এর মেয়াদ বাড়ানোর রিকোয়েস্ট
    type: {
        type: String,
        enum: ['new', 'add', 'renew'],
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    transactionId: {
        type: String,
        required: true,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['bkash', 'nagad'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

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
    // পুরনো একক 'requestedPlan' স্ট্রিং-এর বদলে এখন array of pending requests
    pendingRequests: {
        type: [PendingRequestSchema],
        default: []
    },
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
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);