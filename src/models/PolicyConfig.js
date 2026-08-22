import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

export default mongoose.models.PolicyConfig || mongoose.model('PolicyConfig', policySchema);
