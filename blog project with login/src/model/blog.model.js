import mongoose from "mongoose";

const blogSChema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
    unique: true,
  },
  images: {
    type: String,
    default:
      "https://imgs.search.brave.com/dkBcHM3nTidLzUyHImFjRwWREbWX5Gf412BCtes6J4k/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzBkL2U2/L2IxLzBkZTZiMWEw/MTExNTE5YmYyMTFk/N2E3ODY2NDMxYjJm/LmpwZw",
  },
  category: {
    type: String,
    required: true,
    unique: true,
  },
});

const blogModel = mongoose.model("blogs", blogSChema);

export default blogModel;
