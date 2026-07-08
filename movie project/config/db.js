const mongoose=require('mongoose');

// Connect to MongoDB database
const connectDB=async()=>{
    await mongoose.connect(process.env.MONGO_URL)
    console.log('MongoDB Connected')
}

module.exports=connectDB