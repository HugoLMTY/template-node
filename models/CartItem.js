const mongoose = require('mongoose')

const CartItemSchema = new mongoose.Schema({
    name: {
        type: String
    },        
    totalPrice: {
        type: Number
    },
    qty: {
        type: Number

    },
    idCart:{
        type: String
    },
    idProduct:{
        type: String
    }
})
    

module.exports = mongoose.model('CartItem', CartItemSchema)
