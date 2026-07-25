require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mosabber480_db_user:lKwH9F8nO2BzxpKx@mosabber.3ajdj0u.mongodb.net/quizDB?retryWrites=true&w=majority';

const initialUsers = [
    {
        name: 'Main Owner',
        email: 'owner@example.com',
        password: 'ownerpassword123',
        role: 'owner'
    },
    {
        name: 'Admin One',
        email: 'admin1@example.com',
        password: 'adminpassword1',
        role: 'admin'
    },
    {
        name: 'Admin Two',
        email: 'admin2@example.com',
        password: 'adminpassword2',
        role: 'admin'
    },
    {
        name: 'Test Student User',
        email: 'user@example.com',
        password: 'userpassword123',
        role: 'user'
    }
];

async function seedSystemUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas...');

        for (const userData of initialUsers) {
            let existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                existingUser.role = userData.role;
                existingUser.password = await bcrypt.hash(userData.password, 10);
                await existingUser.save();
                console.log(`🔄 Updated existing user: ${userData.email} (${userData.role})`);
            } else {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                const newUser = new User({
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role
                });
                await newUser.save();
                console.log(`✨ Created new user: ${userData.email} (${userData.role})`);
            }
        }

        console.log('🎉 System users setup completed successfully!');
    } catch (err) {
        console.error('❌ Error seeding users:', err);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.');
    }
}

seedSystemUsers();