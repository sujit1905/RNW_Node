const bookModel = require("../models/book.model")
const path = require("path")
const fs = require("fs")

// Show all books on the home page
async function showImage(req, res) {
    const book = await bookModel.find()
    res.render("index", { book })
}

// Upload a new book
async function uploadImg(req, res) {
    await bookModel.create({
        title: req.body.title,
        image: req.file.filename,
        author: req.body.author,
        price: req.body.price
    })
    res.redirect("/")
}

// Show edit page for a single book
async function editImage(req, res) {
    const book = await bookModel.findById(req.params.id)
    res.render("edit", { book })
}

// Update book details (replace image only if a new one is uploaded)
async function UpdateImage(req, res) {
    const existing = await bookModel.findById(req.params.id)

    let updatedData = {
        title: req.body.title,
        author: req.body.author,
        price: req.body.price
    }

    if (req.file) {
        // Remove old image file from disk
        const oldpath = path.join(__dirname, "../uploads", existing.image)
        if (fs.existsSync(oldpath)) fs.unlinkSync(oldpath)

        updatedData.image = req.file.filename
    } else {
        // Keep the existing image
        updatedData.image = existing.image
    }

    await bookModel.findByIdAndUpdate(req.params.id, updatedData)
    res.redirect("/")
}

// Delete a book and its image file
async function deleteImage(req, res) {
    const existing = await bookModel.findById(req.params.id)

    const oldpath = path.join(__dirname, "../uploads", existing.image)
    if (fs.existsSync(oldpath)) fs.unlinkSync(oldpath)

    await bookModel.findByIdAndDelete(req.params.id)
    res.redirect("/")
}

module.exports = {
    showImage,
    uploadImg,
    editImage,
    UpdateImage,
    deleteImage
}