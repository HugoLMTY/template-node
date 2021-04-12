const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    // USER INFOS
    username: { type: String },
    name: { type: String },
    lastname: { type: String },
    password: { type: String },


    // PERSONNAL INFOS
    address: { type: String },
    sex: { type: String },

    bio: { type: String },
    
    // CONTACT INFOS
    mail: { type: String },
    tel: { type: String },
    
    // SELLER INFOS
    isSeller: { type: Boolean },
    isVerified: { type: Boolean },
    isPending: { type: Boolean },
    group: { type: String },

    // OTHER
    isAdmin: { type: Boolean},
})

module.exports = mongoose.model('User', userSchema)
