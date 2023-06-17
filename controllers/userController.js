const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Post = require('../models/postsModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createTokens } = require('../utils/helpers')
require('dotenv').config()

const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body
    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(password, salt)
    if (!name || !email || !password) {
        res.status(400).json({
            message: "All fields are mandatory"
        })

    }
    //Check if User exists

    const userExists = await User.findOne({ email })
    if (userExists) {
        if (!userExists.isEmailVerified) {
            await User.findOneAndUpdate({ email }, { name, email, password: hashedPass })
            return res.status(201).json({
                id: userExists.id,
                message: "Otp has been sent"
            })
        }
        else {
            return res.status(400).json({
                message: "User with this email exists already"
            })
        }
    }
    //Send OTP
    else {
        //Create User
        const user = await User.create({
            name,
            username,
            email,
            isEmailVerified: false,
            password: hashedPass
        })

        if (user) {
           return res.status(201).json({
                id: user.id,
                message: "Otp has been sent"
            })
        }

    }

})

const checkUsername = asyncHandler(async (req, res) => {
    const { username } = req.body
    const user = await User.findOne({ username })
    if (user && user?.isEmailVerified) {
        return res.status(400).json({ userExists: true, message: "This username has been taken already." })
    }
    else {
        return res.status(200).json({ userExists: false, message: "Username available" })
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    //Check for User
    const user = await User.findOne({ $or :[{email},{username:email}] })
    console.log(req.body)
    if (user && (await bcrypt.compare(password, user.password))) {
        //JWT
        createTokens(user, req, res)
    }
    else {
        res.status(404).json({
            status: 404,
            message: "Invalid username/password"
        })

    }
}
)

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body
    const userExists = await User.findOne({ email })
    //Check for User
    if (userExists) {
        if (otp == 1234) {
            let { id, email, name, isEmailVerified, createdAt, updatedAt } = userExists
            if (isEmailVerified) {
                res.status(401).json({ message: "Email has been verified already" })
            }
            else {
               const user = await User.findOneAndUpdate({ email }, { isEmailVerified: true },{new:true})

                return createTokens(user, req, res)
            }
        }
        else {
            return res.status(401).json({ message: "Invalid Otp" })
        }
    }
    else {
        return res.status(404).json({ message: "User not found" })
    }
}

)

const getUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (user) {
            const { password, ...rest } = user._doc
            return res.json(rest)
        }
        return res.status(400).json({ message: "User doesn't exist" })
    }
    catch (err) {
        res.status(500).json(err)
    }
})

const getBasicUserDetails = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (user) {
            const { email, id, username } = user._doc
            return res.json({ email, id, username })
        }
        return res.status(400).json({ message: "User doesn't exist" })
    }
    catch (err) {
        res.status(500).json(err)
    }
})

const updateUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (user) {
            if (req.user.id == req.params.id || req.user.isAdmin) {
                const { email, isEmailVerified, _id, followers, following, isAdmin, posts, createdAt, updatedAt, ...rest } = req.body
                if (rest.password) {
                    const salt = await bcrypt.genSalt(10)
                    const hashedPass = await bcrypt.hash(rest.password, salt)
                    rest.password = hashedPass
                }
                await user.updateOne({ $set: rest })
                return res.json({ message: "Updated user successfully" })
            }
            return res.status(403).json({ message: "Unauthorized" })
        }
        return res.status(400).json({ message: "User doesn't exist" })
    }
    catch (err) {
        res.status(500).json(err)
    }
})

const deleteUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (user) {
            if (req.user.id == req.params.id || req.user.isAdmin) {
                await user.deleteOne()
                return res.json({ message: "User has been deleted succesfully" })
            }
            return res.status(403).json({ message: "Unauthorized" })
        }
        return res.status(400).json({ message: "User doesn't exist" })
    }
    catch (err) {
        res.status(500).json(err)
    }
})

const refreshToken = asyncHandler(async (req, res) => {
    let token = req.cookies.refreshToken
    if (token) {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (async(err, decoded) => {
            if (err) return res.status(403).json({ message: 'Token expired. Please Login' })
            const user = await User.findById(decoded.id)
            if(user) createTokens(user,req,res)
            else return res.status(403).json({ message: 'Invalid Token' })
        }))
    }
    else {
        res.status(400).json({ message: 'Token is required' })
    }
})

const timelinePosts = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) res.status(400).json({ message: "User not found" })
        const posts = await Promise.all(
            user.following.map(following_users => {
                return Post.find({ user: following_users })
            })  
        )
        const ownPosts = await Post.find({user : user.id}).sort({createdAt:'desc'})
        const allPosts = posts.concat(ownPosts)
        res.json(allPosts)
    } catch (err) {
        res.status(500).json(err)
    }
})

const userPosts = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) res.status(400).json({ message: "User not found" })
        const posts = await Post.find({ user: req.params.id })
        res.json(posts)
    } catch (err) {
        res.status(500).json(err)
    }
})

const searchUser = asyncHandler(async (req, res) => {
    try {
        const keyword = req.body.keyword
        if(!keyword) return res.status(401).json({message:"Keyword is required"})
        const result = await User.find({$or : [{username:{$regex:keyword,$options: 'i'}},{name:{$regex:keyword,$options: 'i'}}]},{password:0,followers:0,following:0,isAdmin:0,posts:0,bio:0,createdAt:0,updatedAt:0})
        return res.status(200).json({isSuccess:true,data:result})
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = { registerUser, loginUser, checkUsername, getBasicUserDetails, updateUser, getUser, deleteUser, verifyOtp, refreshToken, timelinePosts, userPosts,searchUser }