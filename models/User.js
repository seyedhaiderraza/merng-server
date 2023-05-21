const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    username: String,
    password: String,
    email: String,
    createdAt: String
})

const userModel = mongoose.model('user', UserSchema)
module.exports = userModel