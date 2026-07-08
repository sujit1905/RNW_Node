// Sample product data for the ecommerce store


const girlImages = [
  "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1519238263530-99abad111f8b?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1502781252884-05e115c6595e?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1471286174890-9c112dcd89ed?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=400&h=500&fit=crop"
];

const girlClothesNames = [
  "Floral Summer Frock",
  "Embroidered Lehenga Choli",
  "Denim Dungarees",
  "Cotton Printed Kurti",
  "Party Wear Gown",
  "Casual T-Shirt & Skirt Set",
  "Ethnic Salwar Suit",
  "Polka Dot Dress",
  "Designer Western Top",
  "Traditional Anarkali Set",
  "Trendy Jumpsuit",
  "Sequin Party Dress",
  "Comfortable Nightwear Set",
  "Winter Sweater Dress",
  "Festive Sharara Suit"
];

export const products = Array.from({ length: 25 }, (_, i) => {
  const originalPrice = 1000 + Math.floor(Math.random() * 2000);
  const discount = 30 + Math.floor(Math.random() * 40);
  const price = Math.floor(originalPrice * (1 - discount / 100));
  
  return {
    id: i + 1,
    name: girlClothesNames[i % girlClothesNames.length],
    price: price,
    originalPrice: originalPrice,
    discount: discount,
    rating: 0,
    reviews: 0,
    image: girlImages[i % girlImages.length],
    images: [
      girlImages[i % girlImages.length],
      girlImages[(i + 1) % girlImages.length],
    ],
    category: ['Sarees', 'Kurtis', 'Western', 'Lehengas', 'Jewellery'][i % 5],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"],
    description: "Beautiful and comfortable outfit perfect for your little one. Made with premium quality fabric to ensure comfort all day long. Easy to wash and maintain.",
    fabric: "Cotton Blend",
    color: "Multicolor",
  };
});

import sareeImg from '../assets/saree category.jpg';
import kurtiImg from '../assets/kurties category.jpg';
import westernImg from '../assets/western category.jpg';
import lehengaImg from '../assets/lahenga category.jpg';
import jewelleryImg from '../assets/jwellary category.jpg';

export const categories = [
  { id: 1, name: "Sarees", image: sareeImg, count: 245 },
  { id: 2, name: "Kurtis", image: kurtiImg, count: 189 },
  { id: 3, name: "Western", image: westernImg, count: 167 },
  { id: 4, name: "Lehengas", image: lehengaImg, count: 98 },
  { id: 7, name: "Jewellery", image: jewelleryImg, count: 210 },
];

/** Same names as `categories` — only these are valid `product.category` values in the shop. */
export const catalogCategoryLabels = categories.map((c) => c.name);

export const banners = [
  {
    id: 1,
    title: "Summer Collection",
    subtitle: "Up to 60% Off",
    description: "Discover the latest trends in women's fashion",
    bgGradient: "from-gold-100 via-amber-50 to-amber-50",
    ctaText: "Shop Now",
  },
  {
    id: 2,
    title: "Festive Special",
    subtitle: "New Arrivals",
    description: "Elegant sarees & lehengas for every celebration",
    bgGradient: "from-purple-100 via-amber-50 to-gold-50",
    ctaText: "Explore",
  },
];
