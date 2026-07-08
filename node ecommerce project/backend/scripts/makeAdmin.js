import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const email = process.argv[2]?.toLowerCase().trim();

if (!email) {
  console.error('Usage: npm run make-admin -- you@example.com');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const result = await User.updateOne({ email }, { $set: { role: 'admin' } });

if (result.matchedCount === 0) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

console.log(`User ${email} is now admin. Refresh the admin page while logged in.`);
await mongoose.disconnect();
process.exit(0);
