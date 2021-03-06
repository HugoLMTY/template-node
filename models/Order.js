const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    name: {
        type: String
    },          
    idCart:{
        type: String
    },
    requestOrder:{
        type: String
    },
    commentOrder:{
        type: String
    },
    filepathOrder:{
        type: String
    },
    statusOrder:{
        type: String
    }
})
    

module.exports = mongoose.model('Order', OrderSchema)
