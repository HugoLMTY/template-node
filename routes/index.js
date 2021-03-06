const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

router.get('/', async (req, res) => {

    const latest = await Product.find({}).sort({'uploadDate': -1}).limit(6)
    const bestseller = await Product.find({}).limit(6)
    const lowstock = await Product.find({ qty: { $gte: 1 } }).sort('qty').limit(6)

    res.render('index', {
        latest: latest,
        bestseller: bestseller,
        lowstock: lowstock
    })
})

module.exports = router 