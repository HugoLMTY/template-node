const { json } = require('body-parser')
const express = require('express')
const { estimatedDocumentCount } = require('../models/Product')
const router = express.Router()
const Product = require('../models/Product')

router.get('/', async (req, res) => { 

    const limit = 3

    const latest = 
        await Product.find({})
            .sort({'uploadDate': -1})
            .limit(limit)
            
    const latest_2 = 
        await Product.find({})
            .sort({'uploadDate': -1})
            .limit(limit)
            .skip(limit)
    
    const latest_3 = 
        await Product.find({})
            .sort({'uploadDate': -1})
            .limit(limit)
            .skip(limit * 2)

    const bestseller = 
        await Product.find({})
            .limit(limit + 2)
    const lowstock = 
        await Product.find({ qty: { $gte: 1 } })
            .sort('qty')
            .limit(limit)

    res.render('index', {
        latest,
        latest_2,
        latest_3,
        bestseller,
        lowstock
    })
})

module.exports = router 