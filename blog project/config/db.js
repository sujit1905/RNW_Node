const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sujit:sujit123@backend.b4a3mgm.mongodb.net/blogproject';
        await mongoose.connect(mongoURI);
        console.log('✓ Connected to MongoDB');
    } catch (err) {
        console.error('✗ Database connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;