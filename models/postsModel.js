const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    username: {
        type: String,
        ref: 'User',
        required : true
    },
    reactions:{
        smilingWojak : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
        }],
        depressedWojak : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
        }],
        shockedWojak : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
        }],
        smokingWojak : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
        }],
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
    },
    location : {
        type : String,
        default : ""
    }
},
{
    timestamps : true
})

module.exports = mongoose.model('Post', postSchema)