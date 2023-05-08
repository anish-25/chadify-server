const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT
const app = express()

mongoose.connect(process.env.MONGO_URI,() => console.log("Connected") )

app.use(cors({origin:'http://localhost:3000'}))
app.use(express.json())
app.use(morgan('common'))
app.use(helmet())
app.use(cookieParser())

app.use('/api',require('./routes/routes'))

app.listen(port,console.log(`App running on ${port}`))