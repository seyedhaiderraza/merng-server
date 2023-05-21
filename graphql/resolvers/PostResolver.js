const { UserInputError, AuthenticationError } = require('apollo-server')
const postModel = require('../../models/Post')
const { checkAuth } = require('../../utils/checkAuthorisation')
const postResolvers = {
    Query: {
        async getPosts() {
            try {
                const posts = await postModel.find().sort({ createdAt: -1 }) //sort for descending order of creation
                return posts
            } catch (err) {
                throw new Error(err)
            }
        },
        async getPost(_, args, context) {
            const user = checkAuth(context)
            try {
                if (user) {
                    const existingPost = postModel.findById(args.postId)
                    if (existingPost)
                        return existingPost
                    else
                        throw new UserInputError('Post not found')
                }
            } catch (err) {
                throw new AuthenticationError('user not found')
            }
        }
    },
    Mutation: {
        async createPost(_, args, context) {
            const user = checkAuth(context)
                //no need to assert user as error handling already done in checkauth
            try {
                if (args?.body?.trim() == '') {
                    throw new UserInputError('Post cannot be empty')
                }
                const newPost = new postModel({
                    user: user.id,
                    username: user.username,
                    body: args.body,
                    createdAt: new Date().toISOString()
                })
                return await newPost.save()

                context.pubsub.publish('NEW_POST', {
                    newPost: newPost
                })

            } catch (err) {
                throw new UserInputError(err)
            }
        },
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context)
            try {
                if (user) {
                    const existingPost = postModel.findById(postId)
                    if (existingPost) {
                        const deleteStatus = await postModel.deleteOne({ _id: postId })
                      
                        return deleteStatus.deletedCount === 1 ? 'post deleted successfully' : "post delete failure"
                    }
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async createComment(_, args, context) {
            const { postId, body } = args
            const user = checkAuth(context)

            try {
                if (body.trim() == '') { throw new UserInputError('comment cannot be empty') }
                const newComment = { username: user.username, body: body, createdAt: new Date().toISOString() }
                const post = await postModel.findById({ _id: postId })
                post.comments.unshift(newComment)
                await post.save()
                return post;
            } catch (err) {
                throw new Error('Post Not Found')
            }
        },
        async deleteComment(_, args, context) {
            const { postId, commentId } = args
            const user = checkAuth(context)
            try {

                const post = await postModel.findById({ _id: postId })

                const commentIndex = post.comments.findIndex(comment => comment.id === commentId)
                if (post.comments[commentIndex].username !== user.username) {
                    throw new AuthenticationError('User Not Allowed to delete this comment')
                }
                post.comments.splice(commentIndex, 1)
                await post.save()
                return post


            } catch (err) {
                throw new Error('Post Not Found')
            }
        },
        async likeUnlikePost(_, args, context) {
            const user = checkAuth(context)
            try {
                const post = await postModel.findById({ _id: args.postId })

                if (post.likes && post.likes.find((like) => like.username === user.username)) {
                    const reducedLikes = post.likes.filter(like => like.username !== user.username)
                    post.likes = reducedLikes
                    await post.save()
                    return post
                } else {
                    const newLike = {

                        createdAt: new Date().toISOString(),
                        username: user.username
                    }
                    post.likes ? post.likes.push(newLike) : post.likes = [newLike]
                        //  post.likes = likes

                    await post.save()
                    return post
                }
            } catch (err) {
                throw new Error('Post doesn\'t exists')
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}

module.exports = postResolvers