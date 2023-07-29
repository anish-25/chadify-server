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
const { v4: uuidv4 } = require('uuid');

require('dotenv').config()
const port = process.env.PORT
const app = express()

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-cred.json.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://chadify-c49d8.appspot.com/'
});

const bucket = admin.storage().bucket();

mongoose.connect(process.env.MONGO_URI, () => console.log("Connected"))

// app.use(cors({ origin: 'https://chadify-client.vercel.app', credentials: true }))
app.use(cors())
app.use(express.json())
app.use(morgan('common'))
app.use(helmet())
app.use(cookieParser())

const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

app.post('/api/upload', [verifyToken, upload.single("file")], (req, res) => {
    try {
        console.log(req.body)
        const file = req.file;
        const name = req.body.name || uuidv4();
        if (!file) {
            return res.status(400).json({ error: 'No file received' });
        }
        let dest;
        if (req.body.avatar) {
            dest = `avatars/${name}`;
        } else {
            dest = `${req.user.id}/${name}`;
        }
        const blob = bucket.file(dest);
        const blobStream = blob.createWriteStream();

        blobStream.on('error', (error) => {
            console.error(error);
            return res.status(500).json({ error: 'Failed to upload file' });
        });

        blobStream.on('finish', () => {
            return res.status(200).json({ message: 'File uploaded successfully' });
        });

        blobStream.end(file.buffer);
        // return res.status(200).json({ message: "File uploaded successfully" })
    } catch (err) {
        return res.status(500).json(err)
    }
})

app.use('/images', express.static(path.join(__dirname, 'public/images')))

app.use('/api', require('./routes/routes'))

app.listen(port, console.log(`App running on ${port}`))