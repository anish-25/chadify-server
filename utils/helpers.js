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
  let { password, isAdmin, createdAt, updatedAt, _id, ...filtered } = user._doc
  return res.json({
    ...filtered, id: user._doc._id,
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
    const urls = await Promise.all(storageRefs.map(async (storageRef) => {
      let avatar = ""
      let media = ""
      try {
        avatar = await storageRef.avatar.getDownloadURL()
      }
      catch (err) {
        avatar = ""
      }
      try {
        media = await storageRef.media.getDownloadURL()
      }
      catch (err) {
        media = ""
      }
      return { media, avatar }
    }));
    userPosts.map((post, index) => {
      let withAvatar = {}
      if(post?._doc){
        withAvatar = { ...post?._doc, media: urls[index].media, avatar: urls[index].avatar }
      }
      else{
        withAvatar = { ...post, media: urls[index].media, avatar: urls[index].avatar }
      }
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
    try {
      let url = await storageRef.getDownloadURL()
      if (url) return url
      else return ""
    } catch (err) {
      return ""
    }
  }
  else return ""
}

module.exports = { createTokens, replaceWithFirebaseUrl, getUserAvatar }