const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');


// mongodb+srv://booksearch:booksearch@booksearchcluster.0qrgozy.mongodb.net/?retryWrites=true&w=majority

module.exports = mongoose.connection;
