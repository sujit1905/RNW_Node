const movieModel=require("../models/movie.model")
const fs=require("fs")  // File system operations
const path = require("path")

// Create new movie record with uploaded image
async function addMovie(req,res){
    const movie=await movieModel.create({
        title:req.body.title,
        img:req.file.filename,
        year:req.body.year,
        type:req.body.type
    })
    res.redirect("/")
}   


// Fetch all movies and render add page
async function getMovies(req,res){
    const movies=await movieModel.find()
    res.render("add",{movies})
}


// Fetch movie details for edit page
async function getEditPage(req,res){
    const movie=await movieModel.findById(req.params.id)
    res.render("edit",{movie})
}


// Update movie record and handle image replacement
async function updateMovie(req,res){
    const movieId = req.params.id
    const oldMovie = await movieModel.findById(movieId)
    
    // Delete old image if new image is uploaded
    if(req.file){
        const oldImagePath = path.join(__dirname,"../uploads",oldMovie.img)
        if(fs.existsSync(oldImagePath)){
            fs.unlinkSync(oldImagePath)
        }
    }
    
    // Prepare updated data
    const updatedData = {
        title:req.body.title,
        year:req.body.year,
        type:req.body.type
    }
    
    // Update image only if new file uploaded
    if(req.file){
        updatedData.img = req.file.filename
    }
    
    await movieModel.findByIdAndUpdate(movieId,updatedData)
    res.redirect("/")
}


// Delete movie and associated image file
async function deleteMovie(req,res){
    const movieId = req.params.id
    const movie = await movieModel.findById(movieId)
    
    // Remove image from uploads folder
    const imagePath = path.join(__dirname,"../uploads",movie.img)
    if(fs.existsSync(imagePath)){
        fs.unlinkSync(imagePath)
    }
    
    // Remove from database
    await movieModel.findByIdAndDelete(movieId)
    res.redirect("/")
}


module.exports={getMovies,addMovie,getEditPage,updateMovie,deleteMovie}