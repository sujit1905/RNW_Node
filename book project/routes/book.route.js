  const router=require("express").Router()
  const bookcontro=require("../controllers/book.contro")
  const multer=require("multer")
  const path=require("path")

  const storage = multer.diskStorage({
    destination: "./uploads",
    filename: function (req, file, cb) {
      cb(null, Date.now()+path.extname(file.originalname))
    }
  })

  const upload = multer({ storage: storage })





  router.get("/",bookcontro.showImage)

  router.post("/uploads",upload.single("image"),bookcontro.uploadImg)

  router.get("/edit/:id",bookcontro.editImage)

  router.post("/update/:id",upload.single("image"),bookcontro.UpdateImage)


  router.post("/delete/:id",bookcontro.deleteImage)


  module.exports=router