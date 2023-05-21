const mongoose = require('mongoose')

const MONGO_URL = "mongodb://127.0.0.1:27017/gqlproject"

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(
        console.log('connected to mongoDB')
    )

const UserSchema = new mongoose.Schema({
    id: String,
    name: String
})
const UserModel = mongoose.model('User', UserSchema)

const userData = new UserModel({
    id: '123',
    name: 'user1'
})

userData.save()
    .then(
        () => {
            console.log('User saved successfully');
        }
    )