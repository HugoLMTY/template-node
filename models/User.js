const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    // PERSONNAL INFOS
    username: { type: String },
    name: { type: String },
    lastname: { type: String },
    address: { type: String },
    sex: { type: String },
    password: { type: String },

    bio: { type: String },
    
    // CONTACT INFOS
    mail: { type: String },
    tel: { type: String },
    
    // SELLER INFOS
    isSeller: { type: Boolean },
    isPending: { type: Boolean },
    isVerified: { type: Boolean },
    group: { type: String },

    // OTHER
    isAdmin: { type: Boolean},
})

module.exports = mongoose.model('User', userSchema)
