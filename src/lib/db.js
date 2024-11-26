const mongoose = require('mongoose');

exports.connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log('mongodb connected successfully: ', conn.connection.host)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}