const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const Schema = mongoose.Schema
const userSchema = new Schema({
    //We removed the username and password fields from this schema because the passportLocalMongoose will handle that for us and will also salt + hash the password
    admin: {
        type: Boolean,
        default: false
    }
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)