const express = require('express')
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
            .sort({'rating': -1})
            .limit(limit + 2)

    const lowstock = 
        await Product.find({ qty: { $gte: 1 } })
            .sort('qty')
            .limit(limit)

    if (req.cookies['uid'] != undefined) {
        res.render('index', {
            latest,
            latest_2,
            latest_3,
            bestseller,
            lowstock, 
            isConnected: true
        })
    } else {
        res.render('index', {
            latest,
            latest_2,
            latest_3,
            bestseller,
            lowstock
        })
    }
})

module.exports = router 