require("dotenv").config()

const express=require("express")
const app=express()

const connectDB=require("./config/db")
const path=require("path")

const bookrouter=require("./routes/book.route")


connectDB();
app.use(express.json())
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/",bookrouter)

app.listen(3000,()=>{
    console.log("server is running on 3000 port");
})