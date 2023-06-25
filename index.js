const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const path = require('path')
const fs = require('fs')

const cors = require('cors')
const multer = require('multer')
const { verifyToken } = require('./middlewares/verifyToken')

require('dotenv').config()
const port = process.env.PORT
const app = express()

mongoose.connect(process.env.MONGO_URI, () => console.log("Connected"))

app.use(cors({ origin: 'https://chadify-client.vercel.app', credentials: true }))
app.use(express.json())
app.use(morgan('common'))
app.use(helmet())
app.use(cookieParser())

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        let dest = path.join(process.cwd(), "public/images/" + req.user.id)
        if (req.body.avatar) dest = path.join(process.cwd(), "public/images/avatars")
        if (!fs.existsSync(dest)) {
            fs.mkdir(dest, () => {
                cb(null, dest);
            })
        }
        else {
            cb(null, dest);
        }
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name)
    }
})

const upload = multer({ storage })

app.post('/api/upload', [verifyToken, upload.single("file")], (req, res) => {
    try {
        return res.status(200).json({ message: "File uploaded successfully" })
    } catch (err) {
        return res.status(500).json(err)
    }
})

app.use('/images', express.static(path.join(__dirname, 'public/images')))

app.use('/api', require('./routes/routes'))

app.listen(port, console.log(`App running on ${port}`))