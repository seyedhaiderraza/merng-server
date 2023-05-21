const { ApolloServer } = require('apollo-server')
const { PubSub } = require('graphql-subscriptions')
const gql = require('graphql-tag')
const mongoose = require('mongoose')
require('dotenv').config()

const postModel = require('./models/Post')
const userModel = require('./models/User')
const typeDefs = require('./graphql/typeDefs/typeDefs')

const resolvers = require('./graphql/resolvers/resolvers')

const mongoURL = process.env.MONGO_DB
const port = process.env.PORT||5000
const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
})

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to mongodb');
        return server.listen({ port: port })
    })
    .then(res => {
        console.log(`Server running at ${res.url}`);
    })