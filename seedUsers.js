require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 

// Get Mongo URI from environment variable
const MONGO_URI = process.env.MONGO_URI;

const initialUsers = [
    {
        name: 'Mosabber Owner',
        email: 'mosabber.tech@gmail.com',
        password: 'ownerpassword123',
        role: 'owner'
    },
    {
        name: 'Mosabber Admin',
        email: 'mosabber480@gmail.com',
        password: 'adminpassword123',
        role: 'admin'
    },
    {
        name: 'Mosabber Admin',
        email: 'mosabber16376@gmail.com',
        password: 'adminpassword123',
        role: 'admin'
    },
    {
        name: 'General User',
        email: 'user@gmail.com',
        password: 'userpassword123',
        role: 'customer'
    }
];

async function seedSystemUsers() {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is missing in environment variables.');
        }

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
                email: userData.email,
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
    }
}

seedSystemUsers();