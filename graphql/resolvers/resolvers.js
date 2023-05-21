const postsResolvers = require('./PostResolver')
const usersResolvers = require('./UserResolver')
const resolvers = {
    Post: {
        likeCount(parent) {
         
            return parent.likes.length
        },
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        ...postsResolvers.Query

    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation
    },
    Subscription: {
        ...postsResolvers.Subscription
    }
}

module.exports = resolvers