const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {connectDB} = require('./lib/db');

require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());

connectDB()

require("./routes")(app);

module.exports = app;