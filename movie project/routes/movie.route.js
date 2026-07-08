const multer = require("multer")
const path = require("path")
const express=require("express")
const router=express.Router()
const moviecontro=require("../controllers/movie.contro")

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),  // Save to uploads folder
  filename: function (req, file, cb) {
    cb(null, Date.now()+"-"+file.originalname)  // Unique filename: timestamp + original name
  }
})

const upload = multer({ storage: storage })

// API Routes
router.get("/",moviecontro.getMovies)  // Display all movies
router.post("/add",upload.single("img"),moviecontro.addMovie)  // Add new movie
router.get("/edit/:id",moviecontro.getEditPage)  // Get edit form
router.post("/update/:id",upload.single("img"),moviecontro.updateMovie)  // Update movie
router.get("/delete/:id",moviecontro.deleteMovie)  // Delete movie

module.exports=router


