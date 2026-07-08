const mongoose=require("mongoose")

const bookShema=new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    author:{
        type:String,
        require:true
    }
    ,
    price:{
        type:Number,
        require:true
    }
})


const bookModel=mongoose.model("books",bookShema)

module.exports=bookModel    