const mongoose = require("mongoose");
require("dotenv").config();

const mongoUsername = process.env.MONGODB_USERNAME;
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoURI = `mongodb+srv://${mongoUsername}:${mongoPassword}@cluster0.7j0jet6.mongodb.net/?retryWrites=true&w=majority`;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {});

        console.log("MongoDB is Connected!");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
