// Load environment variables from .env file
require("dotenv").config()
const express=require("express")
const app=express()
const connectDB=require("./config/db")
const path=require("path")
const movieRoute=require("./routes/movie.route")

// Connect to MongoDB
connectDB()


// Middleware setup
app.use(express.json())
app.use("/uploads",express.static(path.join(__dirname,"./uploads")))  // Serve uploaded images
app.use(express.urlencoded({extended:true}))

// Configure templating engine
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"./views"))

// Mount routes
app.use("/",movieRoute)

// Start server
app.listen(5500,()=>{
    console.log("server is running on 5500 port");
})