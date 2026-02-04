import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/Ekart`);
        console.log("MongoDB connected Successfully");
    } catch (error) {
        console.log("DB ERROR:", error);
    }
};

export default connectDB;
