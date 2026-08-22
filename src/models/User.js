import mongoose from 'mongoose';

const PendingRequestSchema = new mongoose.Schema({
    plan: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['new', 'add', 'renew', 'change'],
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
    pendingRequests: {
        type: [PendingRequestSchema],
        default: []
    },
    subscription: {
        plan: {
            type: String,
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
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
