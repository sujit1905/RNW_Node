import './loadEnv.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import Order from './models/Order.js';

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const orders = await Order.find({}).populate('user', 'name email').lean();
    console.log(`Found ${orders.length} orders:`);
    
    orders.forEach((o, i) => {
      console.log(`[${i+1}] Order ID: ${o._id}`);
      console.log(`    User: ${o.user?.name || 'Guest'} (${o.user?.email || 'N/A'})`);
      console.log(`    Status: "${o.status}"`);
      console.log(`    Payment Status: "${o.paymentStatus}"`);
      console.log(`    Payment Method: "${o.paymentMethod}"`);
      console.log(`    Total: ₹${o.totalPrice}`);
      console.log(`    Created At: ${o.createdAt}`);
      console.log('-------------------------------------------');
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkOrders();
