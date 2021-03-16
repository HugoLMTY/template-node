const { json } = require('body-parser')
const express = require('express')
const { estimatedDocumentCount } = require('../models/Product')
const router = express.Router()
const Product = require('../models/Product')

router.get('/', async (req, res) => {

    const dates = [
        new Date('2021-02-20'),
        new Date('2021-03-10'),
        new Date('2021-01-20'),
    ]

    dates.forEach(element => {
        console.log('toCompare: ', element)
        compareDates(element)
    })
    

    function compareDates(date) {

        const expire = new Date().setMonth(
            new Date().getMonth() - 1
        )

        
        
        console.log('expire: ', new Date(expire))

        if (date > expire)
            console.log('expired')
        else 
            console.log('ok')
    } 

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