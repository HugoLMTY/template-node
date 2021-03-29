const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    product: {
        type: Object
    },
    user: {
        type: Object 
    },
    rating: {
        type: Number
    },
    comment: {
        type: String
    },
    date: {
        type: String
    }
})

module.exports = mongoose.model('Review', ReviewSchema)