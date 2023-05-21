const { UserInputError } = require('apollo-server')
const bcrypt = require('bcrypt')
const userModel = require('../../models/User')
const { validateRegisterInputs, validateLoginInputs } = require('../../utils/Validations')
const jsonwebtoken = require('jsonwebtoken')
require('dotenv').config()
const genJWTToken = (user) => {

    const token =
        jsonwebtoken.sign({
            id: user.id,
            username: user.username,
            email: user.email,

        }, process.env.SECRET_KEY, { expiresIn: '1h' })
    return token
}
const usersResolvers = {
    Query: {
        async getUsers() {
            try {
                const users = await userModel.find()
                return users
            } catch (err) {
                throw new Error(err)
            }
        }

    },
    Mutation: {
        async registerUser(_, args, context, info) {

            /*
            1. validate args(username, password, confirmPassword)
            2. check if user already exists in DB
            3. convert password into hash -> store the new user details
            4. generate json web token and return jwt token + userdetails returned from mongodb
            */
            const {
                username,
                password,
                confirmPassword,
                email
            } = args.registerUserInput
                // 1. validate args(username, password, confirmPassword)
            const { valid, validationResult } = validateRegisterInputs(username,
                password,
                confirmPassword,
                email);
            if (!valid) {
                throw new UserInputError('Request Validation error', { errors: { validationResult } })
            }


            //  2. check if user already exists in DB
            const existingUser = await userModel.findOne({ username })
            if (existingUser)
                throw new UserInputError('Username already taken', { errors: { username: 'username already taken' } })
                    // 3. convert password into hash -> store the new user details
            const hashedPassword = await bcrypt.hash(password, 12)

            const newUser = new userModel({
                username: username,
                password: hashedPassword,
                email: email,
                createdAt: new Date().toISOString()
            })
            const user = await newUser.save() //returned user in response will have id as well
                //4. generate json web token and return jwt token + userdetails returned from mongodb
            const token = genJWTToken(user)

            return {
                ...user._doc,
                id: user._id,
                token: token
            }
        },

        async loginUser(_, args, context, info) {
            const { username, password } = args
            const { valid, validationResult } = validateLoginInputs(username,
                password);
            if (!valid) {
                throw new UserInputError('Request Validation error', { errors: { validationResult } })
            }
            //find existing user else throw error
            const user = await userModel.findOne({ username })
            if (!user) {
                throw new UserInputError('User Not Exists', { errors: { username: 'User Not found' } })
            }
            //match passwords, if not match throw error
            const validPass = await bcrypt.compare(password, user.password)

            if (!validPass) {
                throw new UserInputError('Password incorrect', { errors: { password: 'password incorrect than actual password' } })
            }
            //generate jwt and send respone(user+token)
            const token = genJWTToken(user)
          
            return {
                ...user._doc,
                id: user._id,
                token: token
            }
        }
    }

}

module.exports = usersResolvers