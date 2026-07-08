import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const girlImages = [
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1519238263530-99abad111f8b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1502781252884-05e115c6595e?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1471286174890-9c112dcd89ed?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=400&h=500&fit=crop',
];

/** Only these five — matches frontend `categories` / shop navigation. */
const shopProducts = [
  { name: 'Banarasi Silk Saree', category: 'Sarees', fabric: 'Silk', colors: ['Red', 'Maroon', 'Gold'] },
  { name: 'Chiffon Printed Saree', category: 'Sarees', fabric: 'Chiffon', colors: ['Blue', 'Navy', 'Teal'] },
  { name: 'Linen Cotton Saree', category: 'Sarees', fabric: 'Cotton', colors: ['Beige', 'Cream', 'Ivory'] },
  { name: 'Organza Designer Saree', category: 'Sarees', fabric: 'Organza', colors: ['Peach', 'Pink', 'Rose'] },
  { name: 'Kanjivaram Style Saree', category: 'Sarees', fabric: 'Silk Blend', colors: ['Maroon', 'Purple', 'Gold'] },
  { name: 'Chikankari Kurti Set', category: 'Kurtis', fabric: 'Cotton', colors: ['White', 'Ivory', 'Mint'] },
  { name: 'A-Line Printed Kurti', category: 'Kurtis', fabric: 'Rayon', colors: ['Yellow', 'Orange', 'Mustard'] },
  { name: 'Mirror Work Kurti', category: 'Kurtis', fabric: 'Cotton', colors: ['Teal', 'Green', 'Blue'] },
  { name: 'Anarkali Kurti Dupatta', category: 'Kurtis', fabric: 'Georgette', colors: ['Purple', 'Violet', 'Lavender'] },
  { name: 'Straight Cut Office Kurti', category: 'Kurtis', fabric: 'Crepe', colors: ['Navy', 'Black', 'Grey'] },
  { name: 'Denim Jacket Women', category: 'Western', fabric: 'Denim', colors: ['Blue', 'Black', 'White'] },
  { name: 'Maxi Boho Dress', category: 'Western', fabric: 'Viscose', colors: ['Multicolor'] },
  { name: 'Casual Co-ord Set', category: 'Western', fabric: 'Cotton Blend', colors: ['Green', 'Olive', 'Beige'] },
  { name: 'Trendy Jumpsuit', category: 'Western', fabric: 'Rayon', colors: ['Black', 'Navy', 'Maroon'] },
  { name: 'Printed Palazzo Set', category: 'Western', fabric: 'Rayon', colors: ['Multicolor', 'Pink', 'Yellow'] },
  { name: 'Off-Shoulder Top', category: 'Western', fabric: 'Crepe', colors: ['Beige', 'White', 'Pink'] },
  { name: 'Ruffle Midi Dress', category: 'Western', fabric: 'Chiffon', colors: ['Peach', 'Rose', 'Lavender'] },
  { name: 'Velvet Lehenga Choli', category: 'Lehengas', fabric: 'Velvet', colors: ['Royal Blue', 'Purple', 'Navy'] },
  { name: 'Embroidered Lehenga Set', category: 'Lehengas', fabric: 'Silk Blend', colors: ['Maroon', 'Red', 'Gold'] },
  { name: 'Sequin Party Lehenga', category: 'Lehengas', fabric: 'Net', colors: ['Gold', 'Silver', 'Rose'] },
  { name: 'Floral Print Lehenga', category: 'Lehengas', fabric: 'Georgette', colors: ['Pink', 'Peach', 'Mint'] },
  { name: 'Bridal Style Lehenga', category: 'Lehengas', fabric: 'Silk', colors: ['Red', 'Maroon', 'Pink'] },
  { name: 'Kundan Necklace Set', category: 'Jewellery', fabric: 'Alloy', colors: ['Gold', 'Silver'] },
  { name: 'Gold Plated Earrings', category: 'Jewellery', fabric: 'Brass', colors: ['Gold'] },
  { name: 'Pearl Bracelet Set', category: 'Jewellery', fabric: 'Alloy', colors: ['White', 'Cream'] },
];

const products = shopProducts.map((item, i) => {
  const originalPrice = 1000 + Math.floor((i * 137 + 400) % 2000);
  const discount = 30 + Math.floor((i * 7 + 10) % 40);
  const price = Math.floor(originalPrice * (1 - discount / 100));
  const imageIdx = i % girlImages.length;

  return {
    ...item,
    colors: item.colors || [],
    color: (item.colors && item.colors[0]) || item.color || 'Multicolor',
    price,
    originalPrice,
    discount,
    rating: 0,
    reviews: 0,
    image: girlImages[imageIdx],
    images: [girlImages[imageIdx], girlImages[(imageIdx + 1) % girlImages.length]],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Beautiful piece crafted with care. Premium quality for comfort and style — perfect for your collection.',
  };
});

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await Product.deleteMany();
    console.log('Products cleared');

    await Product.insertMany(products);
    console.log(`${products.length} Products Inserted!`);

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
