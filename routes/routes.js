const express = require('express')
const router = express.Router()
const { registerUser, loginUser, deleteUser, verifyOtp, refreshToken, timelinePosts, userPosts, updateUser, getUser, checkUsername, getBasicUserDetails } = require('../controllers/userController')
const { verifyToken } = require('../middlewares/verifyToken')
const { followUser, likeDislikePost } = require('../controllers/actionsController')
const { createPost, updatePost, getPost, deletePost } = require('../controllers/postController')

//-----------Auth-----------------//

//Register
router.post('/register', registerUser)

//Login
router.post('/login', loginUser)

//Check if username exists
router.post('/username', checkUsername)

//Verify OTP
router.post('/verify-otp', verifyOtp)

//Refresh token
router.get('/refresh-token', refreshToken)

//Get basic user details without auth
router.get('/user-details/:id',getBasicUserDetails)


//-----------User Actions--------------//

//Get user details
router.get('/user/:id',verifyToken,getUser)

//Delete
router.delete('/user/:id', verifyToken, deleteUser)

//Update user
router.put('/user/:id', verifyToken, updateUser)

//Follow or unfollow user
router.post('/follow-unfollow', verifyToken, followUser)

//Like or dislike post
router.put('/like-dislike/:id', verifyToken, likeDislikePost)

//Get timeline posts
router.get('/timeline/:id', verifyToken, timelinePosts)

//Get user posts
router.get('/user-posts/:id', verifyToken, userPosts)



//-----------Post---------------------//

//Create a  post
router.post('/posts', verifyToken, createPost)

//Update a post
router.put('/posts/:id', verifyToken, updatePost)

//Get a post's details
router.get('/posts/:id', verifyToken, getPost)

//Delete a post
router.delete('/posts/:id', verifyToken, deletePost)


module.exports = router
