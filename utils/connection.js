const DB_URL = require('../config').DB_URL;
const mongoose = require('mongoose');


const connection = async() => {
    try{
        await mongoose.connect(DB_URL);
        console.log("DB Connected...");
    }catch(err){
        console.log("Error on connection", err.message);
    }
}

module.exports= connection;