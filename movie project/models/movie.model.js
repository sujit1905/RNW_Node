const mongoose=require("mongoose")

// Define Movie schema with required fields
const movieSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true  // Movie title
    },
    img:{
        type:String,
        required:true  // Image filename
    },
    year:{
        type:Number,
        required:true  // Release year
    },
    type:{
        type:String,
        required:true  // Movie genre/type
    }
})

// Create Movie model
const Movie=mongoose.model("Movie",movieSchema)

module.exports=Movie