const mongoose = require('mongoose')

const CartItemSchema = new mongoose.Schema({
    _id: {
        type: String
    },
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
