const express = require("express")
const router = express.Router();
const imageController = require("../controllers/img.controller")
const path = require("path")
const multer = require("multer")
const fs = require("fs")
const imgModel = require('../models/img.model')


const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })



// SHOW ALL IMAGES
router.get("/", imageController.showImage)

// UPLOAD NEW IMAGE
router.post("/uploads", upload.single('image'), imageController.imgUpload)

// EDIT PAGE
router.get("/edit/:id", async (req, res) => {
  
    const image = await imgModel.findById(req.params.id)
    res.render("edit", { image })
 
})

// UPDATE — replaces old file in uploads if a new one is provided
router.post("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const existing = await imgModel.findById(req.params.id)
    if (!existing) return res.status(404).send("Image not found")

    let updateData = {}

    if (req.file) {
      // Delete the OLD image file from disk
      const filePath = path.join(__dirname, "../uploads", existing.image)
      fs.unlinkSync(filePath)
      updateData.image = req.file.filename
    }

    await imgModel.findByIdAndUpdate(req.params.id, updateData)
    res.redirect("/")
  } catch (error) {
    console.error(error)
    res.status(500).send("Error updating image")
  }
})

// DELETE — removes DB record AND the file from uploads folder
router.post("/delete/:id", async (req, res) => {
    const existing = await imgModel.findById(req.params.id)
  
      // Delete the OLD image file from disk
      const filePath = path.join(__dirname, "../uploads", existing.image)
      fs.unlinkSync(filePath)
     
    
      await imgModel.findByIdAndDelete(req.params.id)
      res.redirect("/")
  
})




module.exports=router