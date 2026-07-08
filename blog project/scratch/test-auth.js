const mongoose = require('mongoose');
const User = require('../models/user.model');
const connectDB = require('../config/db');

async function test() {
    try {
        await connectDB();
        
        console.log('Cleaning up test user if exists...');
        await User.deleteOne({ email: 'test@example.com' });
        
        console.log('Creating new test user...');
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        });
        
        await user.save();
        console.log('User created successfully. Hashed Password in DB:', user.password);
        
        // Find user
        console.log('Finding user by email...');
        const foundUser = await User.findOne({ email: 'test@example.com' }).select('+password');
        console.log('Found User Password in DB:', foundUser.password);
        
        // Compare password
        console.log('Comparing with correct password "password123"...');
        const isMatch = await foundUser.comparePassword('password123');
        console.log('Is Correct Match:', isMatch);
        
        console.log('Comparing with wrong password "wrongpassword"...');
        const isWrongMatch = await foundUser.comparePassword('wrongpassword');
        console.log('Is Wrong Match:', isWrongMatch);
        
        await User.deleteOne({ email: 'test@example.com' });
        console.log('Cleaned up test user.');
        
        mongoose.connection.close();
    } catch (err) {
        console.error('Error during test:', err);
        mongoose.connection.close();
    }
}

test();
