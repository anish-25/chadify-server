const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
}],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
}],
    mediaType : {
        type : String,
        enum : ['image','video'],
        required : true
    },
    media: {
        type: String,
        required : true,
    },
    caption : {
        type : String,
        default : ""
    }
})

module.exports = mongoose.model('Post', postSchema)