import './loadEnv.js';
import mongoose from 'mongoose';
import Order from './models/Order.js';

async function testUpdate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find a placed order (for example, Order 1)
    const order = await Order.findOne({ status: 'placed' });
    if (!order) {
      console.log('No order with status "placed" found.');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Updating Order ID: ${order._id} (Current status: "${order.status}")`);
    
    // Try to change it to delivered
    order.status = 'delivered';
    await order.save();
    console.log('Order saved successfully!');
    
    // Re-fetch to verify
    const updated = await Order.findById(order._id);
    console.log(`Re-fetched Order ID: ${updated._id} (New status: "${updated.status}")`);
    
    // Reset it back to placed
    updated.status = 'placed';
    await updated.save();
    console.log('Reset back to "placed" successfully!');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during update:', err);
  }
}

testUpdate();
