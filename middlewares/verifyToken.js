const jwt = require('jsonwebtoken')
const verifyToken = (req,res,next) => {
    const token = req.headers.authorization
    if(token){
    const accessToken = token.split(' ')[1]
    jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET,(err,decoded) => {
        if(err){
            if(err instanceof jwt.TokenExpiredError) res.status(401).json({message: "Token expired"})
            else res.status(401).json({message: "Invalid token"})
        } 
        else{
            req.user = decoded
            next()
        }
    })
    }else{
        res.status(403).json({message:"Token is required"})
    }
}

module.exports = {verifyToken}