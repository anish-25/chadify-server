const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Post = require('../models/postsModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
require('dotenv').config()

const createPost = asyncHandler(async (req, res) => {
    try {
        if(req.user.id !== req.body.user) return res.status(401).json({message:"Unauthorized"})
        const user = await User.findById(req.body.user)
        if(!user) return res.status(401).json({message:"Invalid /userId"})
        req.body.username = user.username
        const post = new Post(req.body)
        await post.save()
       return res.json(post)
    }
    catch (err) {
        res.status(500).json(err)
    }
})

const updatePost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post)
            res.status(400).json({ message: 'Post not found' })
        if (post.user) {
            if (!req.body.userId) res.status(403).json({ message: `/userId is required` })
            if (post.user == req.body.userId) {
                const { media, mediaType, ...rest } = req.body
                const filtered = { ...rest }
                await post.updateOne({ $set: filtered })
                res.status(200).json({ message: "Updated post successfully" })
            } else {
                res.status(403).json({ message: "Forbidden : User can only update their post" })
            }
        } else {
            res.status(400).json({ message: 'Post not found' })
        }
    }
    catch (err) {
        res.status(500).json(err)
    }
})

const getPost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) res.status(400).json({ message: "Invalid Post ID" })
        res.status(200).json(post)
    } catch (err) {
        res.status(500).json(err)
    }
})

const deletePost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) res.status(400).json({ message: "Invalid Post ID" })
        //Do an additional check here if user is authenticated for the following action
        await post.deleteOne()
        res.status(200).json({message:"Successfully deleted "})

    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = { createPost, updatePost, getPost, deletePost }