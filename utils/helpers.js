const jwt = require('jsonwebtoken')
const firebase = require('../firebase')
const createTokens = (user, req, res) => {
  const accessToken = jwt.sign({ "username": user.name, "id": user.id, "isAdmin": user.isAdmin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
  const refreshToken = jwt.sign({ "username": user.name, "id": user.id, "isAdmin": user.isAdmin }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
  res.status(201)
  res.cookie("refreshToken", refreshToken, {
    domain: 'chadify-server.vercel.app',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  })
  return res.json({
    id: user.id,
    name: user.name,
    username: user.username,
    isEmailVerified: user.isEmailVerified,
    accessToken: { token: accessToken, maxAge: 300 * 1000 },
    refreshToken: { token: refreshToken, maxAge: 300 * 1000 },
  })
}

const replaceWithFirebaseUrl = async (userPosts) => {
  let temp = []
  const storageRefs = userPosts.map((post) => {
    return { media: firebase.storage().ref(post.user + '/' + post.media), avatar: firebase.storage().ref('avatars/' + post.user + '.png') };
  })

  try {
    const urls = await Promise.all(storageRefs.map(async (storageRef) => ({ media: await storageRef.media.getDownloadURL(), avatar: await storageRef.avatar.getDownloadURL() })));
    userPosts.map((post, index) => {
      let withAvatar = { ...post?._doc, media: urls[index].media, avatar: urls[index].avatar }
      console.log(withAvatar)
      temp.push(withAvatar)
    })
  } catch (error) {
    console.log(error)
  }
  return temp
}

const getUserAvatar = async (userId) => {
  let filename = userId.toString()
  if (filename.length) {
    const storageRef = firebase.storage().ref('avatars/' + filename + '.png')
    let url = await storageRef.getDownloadURL()
    if (url) return url
    else return ""
  }
  else return ""
}

module.exports = { createTokens, replaceWithFirebaseUrl, getUserAvatar }