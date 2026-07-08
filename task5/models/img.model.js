const mongoose=require("mongoose")

const imgSchems=new mongoose.Schema({
     image: {
        type: String,
        required: true
    }
})

const imgModel=mongoose.model("img",imgSchems)


module.exports=imgModel