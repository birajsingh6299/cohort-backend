import mongoose from "mongoose"

const db = () => {
    mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("Connected to mongodb"); 
    })
    .catch(()=>{
        console.log("Error connecting to mongodb");
    });
}

export default db;


