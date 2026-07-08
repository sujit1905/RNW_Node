import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const cats = await Category.find({});
  const prods = await Product.find({});
  console.log('Categories count:', cats.length);
  console.log('Categories:', cats.map(c => c.name));
  console.log('Products count:', prods.length);
  await mongoose.disconnect();
}
run();
