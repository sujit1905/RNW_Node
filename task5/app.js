require("dotenv").config()
const express=require("express")
const app=express()
const path=require("path")
const connectDB=require("./config/db")
const router = require("./routes/img.route")

connectDB()

app.set("view engine","ejs")

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("/uploads",express.static(path.join(__dirname,"uploads")))

app.use("/",router)


app.listen(3000,()=>{
    console.log("server is running on 3000 port");
})

