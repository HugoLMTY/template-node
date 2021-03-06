const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String
    },
    price: {
        type: Number
    },
    creator: {
        type: String
    },
    uploadDate: { 
        type: String
    },
    desc: {
        type: String
    },
    qty: {
        type: Number
    },
    type: {
        type: String
    },
    pathImg: {
        type: String
    },
    height: {
        type: Number
    },
    width: {
        type: Number
    },
    lenght: {
        type: Number
    }
})

module.exports = mongoose.model('Product', productSchema)