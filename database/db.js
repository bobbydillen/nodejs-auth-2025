const mongoose = require('mongoose');

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB is connected");

      
    } catch (err) {
        console.error("Database Connection Error:", err);
        process.exit(1);
    }
}

module.exports = connectToDB;
