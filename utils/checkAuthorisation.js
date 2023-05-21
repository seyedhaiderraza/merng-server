const { AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
require('dotenv').config()
module.exports.checkAuth = (context) => {
    const authHeader = context.req.headers.authorization
    try {
        if (authHeader !== '') {
            const authToken = authHeader?.split('Bearer ')[1] //remember <space> after Bearer
            if (authToken !== '') {
                const user = jwt.verify(authToken, process.env.SECRET_KEY)
                if (user)
                    return user
                else
                    throw new AuthenticationError('Invalid token')
            } else {
                throw new Error('Token cannot be empty')
            }
        } else {
            throw new Error('Authorisation header not  provided')
        }
    } catch (err) {
        throw new Error(err)
    }
}