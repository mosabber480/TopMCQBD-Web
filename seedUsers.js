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

import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI_PAID || process.env.MONGO_URI;

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
        if (!MONGO_URI) {
            throw new Error('MONGODB_URI_PAID environment variable is missing in .env');
        }
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
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
