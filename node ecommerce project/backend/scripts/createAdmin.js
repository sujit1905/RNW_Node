import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const email = 'admin@admin.com';
const passwordRaw = 'admin@123';
const name = 'Admin User';

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Checking if admin user exists...');
    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    if (!user) {
      console.log('Creating new admin user...');
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin user created successfully:', user.email);
    } else {
      console.log('Admin user already exists. Updating role and password...');
      user.password = hashedPassword;
      user.role = 'admin';
      await user.save();
      console.log('Admin user updated successfully.');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

run();
