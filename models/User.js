const mongoose = require('mongoose');

// একটা একটা Pending Request-এর Schema (একাধিক request একসাথে থাকতে পারবে)
const PendingRequestSchema = new mongoose.Schema({
    plan: {
        type: String, // 💡 enum রিমুভ করা হয়েছে যাতে কাস্টম প্যাকেজের নাম সেভ করা যায়
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
        enum: ['pending', 'approved', 'rejected'],
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
            type: String, // 💡 enum রিমুভ করা হয়েছে যাতে কাস্টম প্যাকেজের নাম সেভ করা যায়
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
    },
    // 💡 পাসওয়ার্ড রিসেটের জন্য নতুন দুটি ফিল্ড যোগ করা হলো
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
```[cite: 4]

এটি সেভ করার পর আমাদের ব্যাকএন্ড এবং ডেটাবেস স্কিমার কাজ পুরোপুরি শেষ! এখন আমাদের ফ্রন্টএন্টে **`forgot-password.html`** এবং **`reset-password.html`** পেজ দুটি তৈরি করতে হবে। 

এটি করার জন্য প্রস্তুত থাকলে আমাকে জানান, আমি পেজ দুটির কোড দিয়ে দিচ্ছি।