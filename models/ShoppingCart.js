const mongoose = require('mongoose')

const shoppingCartSchema = new mongoose.Schema({
    name: {
        type: String
    }
})

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema)