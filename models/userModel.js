const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please add a name']
    },
    username : {
        type : String,
        required : [true, 'Please add an username'],
        unique : true,
    },
    email : {
        type : String,
        required : [true, 'Please add an email'],
        unique : true
    },
    password : {
        type : String,
        required : [true, 'Please add a password']
    },
    isEmailVerified : {
        type : Boolean,
        required : [true, 'isEmailVerified is required']
    },
    followers : [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    following : [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    avatar : {
        type : String,
        default: "",
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    bio: {
        type : String,
        default : ""
    },
    posts: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }]
    },
{
    timestamps : true
})

module.exports = mongoose.model('User',userSchema)