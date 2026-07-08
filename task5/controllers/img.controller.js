const imgModel=require('../models/img.model')


const showImage = async (req, res) => {
    try {
        const imagesdata = await imgModel.find()
        res.render("index", {
            imagesdata
        })
    } catch (error) {
        res.status(500).send("Server Error")
    }
}
const imgUpload=async(req,res)=>{
 try {
        await imgModel.create({
            image: req.file.filename
        })
        res.redirect("/")
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading image");
    }
}

module.exports={
    imgUpload,
    showImage
}