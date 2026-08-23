import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DIRECT_PAID_URI = 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fixUserPasswords() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(DIRECT_PAID_URI);
  console.log('Connected!');

  const defaultPasswordMap = {
    'mosabber480@gmail.com': 'admin123456',
    'mosabber.tech@gmail.com': 'admin123456',
    'mosabber16376@gmail.com': 'admin123456',
    'user@gmail.com': 'user123456',
    'usertest@gmail.com': 'user123456',
    'usertest55@gmail.com': 'user123456'
  };

  const users = await User.find({});
  for (const u of users) {
    const rawPass = defaultPasswordMap[u.email] || '123456';
    const newHash = await bcrypt.hash(rawPass, 6);
    u.password = newHash;
    await u.save();
    console.log(`✅ Updated ${u.email} (${u.role}) to 6-round edge-safe password hash (pass: ${rawPass})`);
  }

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
}

fixUserPasswords();
