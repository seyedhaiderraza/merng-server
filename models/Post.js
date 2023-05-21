const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({

    username: String,
    body: String,
    createdAt: String,
    comments: [{
        body: String,
        username: String,
        createdAt: String,
    }],
    likes: [{
        username: String,
        createdAt: String,
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
})

const postModel = mongoose.model('post', PostSchema)
module.exports = postModel