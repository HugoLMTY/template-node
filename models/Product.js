const mongoose = require('mongoose')
const path = require('path')

const imgPath = '/products'
const basePath = '/img'

const productSchema = new mongoose.Schema({

    // PRODUCT INFOS
    name: { type: String },
    price: { type: Number },
    desc: { type: String },
    
    pathImg: { type: String },

    // DB INFOS
    uploadDate: { type: String },
    qty: { type: Number },
    rating: { type: Number },
    creator: { type: String },    
    isActive: { type: Boolean }, 

    // PRODUCTS SPECS
    type: { type: String },

    height: { type: Number },
    width: { type: Number },
    lenght: { type: Number },

    weight: { type: Number
    }
})

productSchema.virtual('productImgPath').get(function() {
    return path.join(basePath, imgPath, this.pathImg)
})  

module.exports = mongoose.model('Product', productSchema)
module.exports.imgPath = imgPath