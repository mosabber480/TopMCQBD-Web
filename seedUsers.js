import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';

// Fix for Windows / ISP DNS querySrv ECONNREFUSED on MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server warning:', e);
}

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';
const MONGODB_URI_PAID = process.env.MONGODB_URI_PAID || process.env.MONGO_URI || DIRECT_PAID_URI;

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'customer'], default: 'customer' },
  subscription: {
    plan: { type: String, default: 'none' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: false }
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const seedUsersList = [
  {
    name: 'Mosabber Owner',
    email: 'mosabber.tech@gmail.com',
    password: 'ownerpassword1234',
    role: 'owner',
    subscription: {
      plan: '3_years',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
      active: true
    }
  },
  {
    name: 'Test User',
    email: 'user@example.com',
    password: 'userpassword123',
    role: 'customer',
    subscription: {
      plan: 'none',
      startDate: null,
      endDate: null,
      active: false
    }
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    try {
      await mongoose.connect(MONGODB_URI_PAID);
    } catch {
      await mongoose.connect(DIRECT_PAID_URI);
    }
    console.log('✅ Connected to MongoDB');

    for (const userData of seedUsersList) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });

      if (existingUser) {
        existingUser.name = userData.name;
        existingUser.password = hashedPassword;
        existingUser.role = userData.role;
        existingUser.subscription = userData.subscription;
        await existingUser.save();
        console.log(`✅ Updated existing seed user: ${userData.email} (${userData.role})`);
      } else {
        const newUser = new User({
          ...userData,
          email: userData.email.toLowerCase(),
          password: hashedPassword
        });
        await newUser.save();
        console.log(`✅ Created seed user: ${userData.email} (${userData.role})`);
      }
    }

    const totalUsers = await User.countDocuments();
    console.log(`Current total users in database: ${totalUsers}`);
    console.log('Database verification & seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();
