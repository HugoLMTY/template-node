const mongoose = require('mongoose')

const shoppingCartSchema = new mongoose.Schema({
    price: {
        type: Number
    },
    user: {
        type: String
    },
    cartDate: { 
        type: String
    },
    state: {
        type: String
    }

})
    

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema)
