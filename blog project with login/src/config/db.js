import mongoose from "mongoose";
import config from "./config.js";

function mongoConnect() {
  mongoose.connect(config.MONGO_URI).then(() => {
    console.log("connected to database");
  });
}

export default mongoConnect;
