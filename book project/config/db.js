const mongoose=require("mongoose")


async function connectDB() {

    await mongoose.connect(process.env.MONGO_URL)
    console.log("Database is connected.");
    
    
}

module.exports=connectDB;