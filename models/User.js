const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    mail: {
        type: String
    },
    password: {
        type: String
    },
    group: { 
        type: String
    },
    tel: {
        type: String
    },
    address: {
        type: String
    },
    sex: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)
