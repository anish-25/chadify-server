const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Post = require('../models/postsModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
require('dotenv').config()

const followUser = asyncHandler(async (req, res) => {
    const { requestedBy, userToFollow } = req.body
    if (req.user.id !== req.body.requestedBy) res.status(403).json({ message: "Unauthorized" })
    if (!requestedBy || !userToFollow) res.status(400).json({ message: "userToFollow and requestedBy are required" })
    if (requestedBy == userToFollow) res.status(400).json({ message: "User cannot follow themself" })
    try {
        if (mongoose.Types.ObjectId.isValid(requestedBy) && mongoose.Types.ObjectId.isValid(userToFollow)) {
            const requestedUser = await User.findById(requestedBy)
            const followUser = await User.findById(userToFollow)

            if (!requestedUser || !followUser) return res.json({ message: "User not found" })

            if (requestedUser.following.includes(followUser.id) || followUser.followers.includes(requestedUser.id)) {
                await requestedUser.updateOne({ $pull: { following: followUser.id } })
                await followUser.updateOne({ $pull: { followers: requestedUser.id } })

                return res.json({ message: 'Unfollowed user succesfully' })
            }

            else {
                await requestedUser.updateOne({ $push: { following: followUser.id } })
                await followUser.updateOne({ $push: { followers: requestedUser.id } })

                return res.json({ message: 'Followed user succesfully' })
            }
        }
        else {
            return res.status(400).json({ message: 'Invalid User Id type' })
        }
    }
    catch {
        return res.status(500).json({ message: 'Something went wrong' })
    }
})

const likeDislikePost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) res.status(400).json({ message: 'Invalid Post ID' })
        if (!req.body.userId) res.status(400).json({ message: "/userId is required" })
        const user = await User.findById(req.body.userId)
        if (!user) res.status(400).json({ message: 'Invalid user' })
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } })
            res.json({ message: "Post has been liked" })
        }
        else {
            await post.updateOne({ $pull: { likes: req.body.userId } })
            res.json({ message: "Post has been unliked" })
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = { followUser, likeDislikePost }