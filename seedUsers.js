import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import User from './src/models/User.js';

// Fix for Windows / ISP DNS querySrv ECONNREFUSED on MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

// Get Mongo URI from environment variable with fallback
const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';
const MONGO_URI = process.env.MONGODB_URI_PAID || process.env.MONGO_URI || DIRECT_PAID_URI;

const initialUsers = [
    {
        name: 'Mosabber Owner',
        email: 'mosabber.tech@gmail.com',
        password: 'ownerpassword1234',
        role: 'owner'
    },
    {
        name: 'General User',
        email: 'user@example.com',
        password: 'userpassword1234',
        role: 'customer'
    }
];

async function seedSystemUsers() {
    try {
        console.log('Connecting to MongoDB...');
        try {
            await mongoose.connect(MONGO_URI);
        } catch {
            await mongoose.connect(DIRECT_PAID_URI);
        }
        console.log('✅ Connected to MongoDB Atlas...');

        // ১. পুরোনো সব ইউজার ডাটাবেজ থেকে মুছে ফেলা
        console.log('🗑️ Cleaning up existing bad user data...');
        await User.deleteMany({});
        console.log('💥 All old users deleted successfully!');

        // ২. নতুন ইউজারগণ ইনসার্ট করা
        for (const userData of initialUsers) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            await User.create({
                name: userData.name,
                email: userData.email.toLowerCase().trim(),
                password: hashedPassword,
                role: userData.role
            });

            console.log(`✨ Created fresh user: ${userData.email} (${userData.role})`);
        }

        console.log('🎉 System users reset completed successfully!');
    } catch (err) {
        console.error('❌ Error seeding users:', err.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.');
        process.exit(0);
    }
}

seedSystemUsers();
