import mongoose from "mongoose";
import "dotenv/config";
import blogModel from "./src/model/blog.model.js";

const MONGO_URI = process.env.MONGO_URI;

const seedData = [
  {
    title: "THE MINIMALIST WARDROBE ESSENTIALS",
    category: "MINIMALISM",
    content: "Building a minimalist wardrobe isn't about restriction; it's about curating a collection of high-quality, versatile pieces. Start with a structured white tee, a pair of raw denim jeans, and a classic leather jacket. Black, white, and neutral tones form the foundation. When every piece works together, getting dressed becomes an effortless statement.",
    images: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "STREETWEAR EVOLUTION: 2026 AND BEYOND",
    category: "STREETWEAR",
    content: "Streetwear has moved past the loud logos and graphic-heavy drops of the early 2020s. Today, it's about subtle luxury, technical fabrics, and oversized silhouettes. Think parachute pants paired with cropped, structured hoodies. The focus is entirely on shape, texture, and utilitarian function rather than screaming a brand name.",
    images: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "MASTERING THE MONOCHROME LOOK",
    category: "TAILORING",
    content: "Monochrome doesn't mean boring. Wearing a single color—especially stark black or off-white—forces you to play with textures and proportions. Pair a heavy knit sweater with sleek wool trousers, or a matte cotton tee with a glossy leather bomber. The contrast in materials creates depth without breaking the minimal aesthetic.",
    images: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "WHY CHUNKY BOOTS ARE HERE TO STAY",
    category: "FOOTWEAR",
    content: "The combat boot silhouette has transcended trends. A heavy, lug-soled black boot grounds any outfit, adding an instant edge. Whether worn with tailored trousers or distressed denim, chunky footwear provides the aggressive, raw foundation that modern minimalist aesthetics require.",
    images: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "ACCESSORIES: LESS IS MORE",
    category: "ACCESSORIES",
    content: "When your clothing is minimal, your accessories must be deliberate. A heavy silver chain, a matte black watch, or a single statement ring is enough. Avoid cluttering your wrists and neck; let the raw metal contrast cleanly against your minimalist wardrobe.",
    images: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "RAW DENIM: A PATIENCE GAME",
    category: "LIFESTYLE",
    content: "Raw, unwashed denim is the purest form of clothing. It starts rigid and uncomfortable, but over months of wear, it molds perfectly to your body, creating unique fades and creases. It's the ultimate personalized garment in a world of fast fashion.",
    images: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "SILHOUETTE OVER BRANDING",
    category: "DESIGN",
    content: "We are entering an era of 'quiet brutalism'. It's no longer about what brand you are wearing, but how the clothing hangs on your frame. Dropped shoulders, wide-leg trousers, and boxy outerwear create a structural look. The garment's architecture is the new logo.",
    images: "https://images.unsplash.com/photo-1523398002811-999aa8d9512e?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "THE ART OF LAYERING",
    category: "OUTERWEAR",
    content: "Effective layering is the secret to a striking outfit. Start with a longline base tee, add a textured mid-layer like a waffle knit, and finish with a structured overshirt or bomber. Keeping the tones muted allows the staggered lengths of the clothing to do the talking.",
    images: "https://images.unsplash.com/photo-1550614000-4b95d4669e11?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "BLACK ON BLACK: THE ETERNAL UNIFORM",
    category: "DENIM",
    content: "There is a reason black is the uniform of designers, artists, and architects. It is absorbing, stark, and completely removes the distraction of color. An all-black outfit is a blank canvas that highlights the wearer's attitude rather than their clothes.",
    images: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "UTILITARIAN AESTHETICS",
    category: "CULTURE",
    content: "Cargo pockets, heavy zippers, and technical fabrics. Utilitarian style bridges the gap between high fashion and everyday functionality. It's clothing designed for movement and purpose, reflecting a lifestyle that is active, raw, and unapologetic.",
    images: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "BREAKING THE RULES OF TAILORING",
    category: "FABRICS",
    content: "The modern suit is no longer confined to the boardroom. Wearing relaxed, unstructured blazers over plain tees with chunky sneakers has redefined tailoring. It's about combining the sharp aggression of formal wear with the effortless ease of streetwear.",
    images: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "THE PERFECT OVERSIZED TEE",
    category: "ESSENTIALS",
    content: "Finding the perfect oversized t-shirt is a quest. It needs a thick collar that sits high on the neck, dropped shoulders, and a heavy, heavyweight cotton drape that holds its shape. Once you find it, buy it in black and white.",
    images: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop"
  }
];

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");
    
    // Clear existing blogs
    await blogModel.deleteMany({});
    console.log("Cleared old blogs");

    // Insert new blogs
    await blogModel.insertMany(seedData);
    console.log("Successfully seeded 12 aesthetic posts");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seedDB();
