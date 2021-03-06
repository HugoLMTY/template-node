const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')

router.get('/', async (req, res) => {

    let searchOptions = {}
    let sortOption = {}

    const r = req.query

    // ------------  NAME  ------------------------------------
    if (r.productFilterName)
        searchOptions.name = r.productFilterName


    // ------------  PRICE  ------------------------------------
    if (r.productFilterMinPrice && r.productFilterMaxPrice)
    {
        searchOptions.price = {
            $gte: r.productFilterMinPrice,
            $lte: r.productFilterMaxPrice
        }
    } 
    else if (r.productFilterMinPrice) 
        searchOptions.price = { $gte: r.productFilterMinPrice }
    else if (r.productFilterMaxPrice)
        searchOptions.price = { $lte: r.productFilterMaxPrice }


    // ------------  DIMENSIONS  ------------------------------------
    if (r.productFilterWidth)
        searchOptions.width = r.productFilterWidth

    if (r.productFilterWidth)
        searchOptions.height = r.productFilterHeight

    if (r.productFilterLength)
        searchOptions.lenght = r.productFilterLenght

    // ------------  STOCK  ------------------------------------
    if (r.productFilterIsStock)
        searchOptions.qty > 0

    
    console.log(searchOptions)

    const productList = await Product.find(searchOptions).sort(sortOption)

    res.render('shop/index', {
        productList: productList
    })
})

router.get('/addProduct', (req, res) => {
    res.render('shop/addProduct')
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

router.get('/products', async (req, res) => {
    const searchOptions = {}
    const r = req.body

    // ------------  NAME  ------------------------------------
    if (r.productFilterName)
        searchOptions.name = {
            $in: r.productFilterName
        }


    // ------------  PRICE  ------------------------------------
    if (r.productFilterMinPrice && r.productFilterMaxPrice)
    {
        searchOptions.price = {
            $gte: r.productFilterMinPrice,
            $lte: r.productFilterMaxPrice
        }
    } 
    else if (r.productFilterMinPrice) 
        searchOptions.price = { $gte: r.productFilterMinPrice }
    else if (r.productFilterMaxPrice)
        searchOptions.price = { $lte: r.productFilterMaxPrice }


    // ------------  DIMENSIONS  ------------------------------------
    if (r.productFilterWidth)
        searchOptions.width = r.productFilterWidth

    if (r.productFilterWidth)
        searchOptions.height = r.productFilterHeight

    if (r.productFilterLength)
        searchOptions.lenght = r.productFilterLenght

    // ------------  STOCK  ------------------------------------
    if (r.productFilterIsStock)
        searchOptions.qty > 0
    
    console.log(searchOptions)

    try {
        const productList = await Product.find(searchOptions)
        res.send(productList).then(
            res.render('/index', {
                productList: productList
            })
        )
    } catch(e) {
        res.send('erreur: ', e)
    }
})

router.get('/product/:id', async (req, res) => {

    let infos = []

    const productID = req.params.id
    console.log(productID)

    const getInfos = Product.findOne({
        _id: productID
    }).then(
        (productInfos) => {
            infos.push(productInfos)
            User.findOne({
                _id: productInfos.creator
            }).then(
                (userInfos) => {
                    infos.push(userInfos)    
                    console.log(infos)
                    res.send(infos)
        })
    })
})


module.exports = router 