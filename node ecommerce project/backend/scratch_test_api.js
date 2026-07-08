import './loadEnv.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Order from './models/Order.js';

async function testApi() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found in database!');
      await mongoose.disconnect();
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    console.log(`Generated Admin Token for ${admin.email}`);
    
    // Find a placed order
    const order = await Order.findOne({ status: 'placed' });
    if (!order) {
      console.log('No placed order found.');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Attempting to mark order ${order._id} as "delivered" via API...`);
    
    const response = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'delivered' })
    });
    
    console.log(`Response Status: ${response.status}`);
    const data = await response.json();
    console.log('Response Body:', data);
    
    if (response.ok) {
      // Reset status back to placed
      order.status = 'placed';
      await order.save();
      console.log('Reset status back to "placed" in DB.');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during API test:', err);
  }
}

testApi();
