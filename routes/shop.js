const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

router.get('/', async (req, res) => {

    let searchOptions = {}
    let sortOption = {}

    const productList = await Product.find(searchOptions).sort(sortOption)

    res.render('shop/index', {
        productList: productList
    })
})

router.post('/new', (req, res) => {
    const newProduct = new Product({
        name: 'prod1',
        price: 39,
        creator: 'doe',
        uploadDate: Date.now(),
        desc: 'product desc',
        qty: 42, 
        type: 'item',
        pathImg: 'samplePrint_3.jpg',
        height: '11',
        width: '12',
        lenght: '12',
    })
    newProduct.save().then(
        res.redirect('/shop/')
    )
})

router.get('/filters', (req, res) => {
    const r = req.body

    
})

module.exports = router 