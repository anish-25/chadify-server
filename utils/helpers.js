const jwt = require('jsonwebtoken')
const firebase = require('../firebase')
const createTokens = (user, req, res) => {
    const accessToken = jwt.sign({ "username": user.name, "id": user.id, "isAdmin": user.isAdmin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    const refreshToken = jwt.sign({ "username": user.name, "id": user.id, "isAdmin": user.isAdmin }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
    res.status(201)
    res.cookie("refreshToken", refreshToken, {
        domain: 'chadify-server.vercel.app',
        path:'/',
        httpOnly: true,
        secure: true,
        sameSite:'none'
         })
    return res.json({
        id: user.id,
        name: user.name,
        username :  user.username,
        isEmailVerified: user.isEmailVerified,
        accessToken: { token: accessToken, maxAge: 300 * 1000 },
        refreshToken: { token: refreshToken, maxAge: 300 * 1000 },
    })
}

 const replaceWithFirebaseUrl = async (userPosts) => {
    const storageRefs = userPosts.map((post) => firebase.storage().ref(post.user + '/' + post.media));
    try {
      const urls = await Promise.all(storageRefs.map((storageRef) => storageRef.getDownloadURL()));
      urls.map((url,index) => userPosts[index].media = url)
    } catch (error) {
    }
    return userPosts
  }

module.exports = {createTokens,replaceWithFirebaseUrl}