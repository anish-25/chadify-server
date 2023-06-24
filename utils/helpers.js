const jwt = require('jsonwebtoken')
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
    })
}

module.exports = {createTokens}