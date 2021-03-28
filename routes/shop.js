const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')

function getDate() {

    const date = new Date().toJSON().split('T')[0]

    let day = date.split('-')[2]
    let month = date.split('-')[1]
    let year = date.split('-')[0]

    return (day + '-' + month + '-' + year)
}

router.get('/', async (req, res) => {
    const r = req.query

    let currentOptions = r

    let searchOptions = {}
    let sortOption = {}


    // ------------  NAME  ------------------------------------
    if (r.productFilterName)
        searchOptions.name = r.productFilterName

    // ------------ SORT ---------------------------------------

    switch (r.productFilterSort) {
        case 'by_name':
            sortOption = { 'name': -1 }
            break

        case 'by_name_':
            sortOption = { 'name': 1 }
            break

        case 'by_price':
            sortOption = { 'price': -1 }
            break

        case 'by_price_':
            sortOption = { 'price': 1 }
            break

        case 'by_upload':
            sortOption = { 'uploadDate': -1 }
            break

        case 'by_upload_':
            sortOption = { 'uploadDate': 1 }
            break
            
        case 'by_qty':
            sortOption = { 'qty': -1 }
            break

        case 'by_qty_':
            sortOption = { 'qty': 1 }
            break
    }

    // ------------  PRICE  ------------------------------------
    if (r.productFilterMinPrice && r.productFilterMaxPrice) {
        searchOptions.price = {
            $gte: r.productFilterMinPrice,
            $lte: r.productFilterMaxPrice
        }
    }
    else if (r.productFilterMinPrice) {
        searchOptions.price = { $gte: r.productFilterMinPrice }
    }
    else if (r.productFilterMaxPrice) {
        searchOptions.price = { $lte: r.productFilterMaxPrice }
    }


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



    Product.find(searchOptions).sort(sortOption).then(
        (productList) => {
            res.render('shop/index', {
                productList,
                currentOptions
            })
        })

})

router.get('/addProduct', (req, res) => {

    const _uid = req.cookies['uid']
    try {
        User.findOne({ '_id': _uid }).then(
            (userInfos) => {
                res.render('shop/newProduct', {
                    userInfos,
                    date: getDate()
                })
            })
    } catch {
        res.redirect('/shop/')
    }
})

router.post('/new', (req, res) => {

    const _uid = req.cookies['uid']
    const r = req.body

    const newProduct = new Product({
        name: r.newProductName,
        price: r.newProductPrice,
        creator: _uid,
        uploadDate: getDate(),
        desc: r.newProductDesc,
        qty: r.newProductQty,
        type: 'item',
        pathImg: r.pathImgProduct,
        width: r.newProductWidth,
        height: r.newProductHeight,
        lenght: r.newProducLength,
        weight: r.newProducWeight
    })
    res.send(newProduct)
    // newProduct.save().then(
    //     res.redirect('/shop/')
    // )
})

router.get('/', async (req, res) => {
    const searchOptions = {}
    const r = req.body

    // ------------  NAME  ------------------------------------
    if (r.productFilterName)
        searchOptions.name = {
            $in: r.productFilterName
        }


    // ------------  PRICE  ------------------------------------
    if (r.productFilterMinPrice && r.productFilterMaxPrice) {
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

    try {
        const productList = await Product.find(searchOptions)
        res.render('shop/index', {
            productList: productList
        })
    } catch (e) {
        res.send('erreur: ', e)
    }
})

router.get('/product/:id', async (req, res) => {

    let infos = []
    const productID = req.params.id
    let productType = ""

    Product.findOne({
        _id: productID
    }).then(
        (productInfos) => {
            productType = productInfos.type
            infos.push(productInfos)
            User.findOne({
                _id: productInfos.creator
            }).then(
                (userInfos) => {
                    infos.push(userInfos)
                }).then(
                    Product.find({ 'type': productType }).limit(4).then(
                        (similarProducts) => {
                            infos.push(similarProducts)
                            res.render('shop/productInfos', {
                                productInfos: infos[0],
                                userInfos: infos[1],
                                similarProducts: infos[2]
                            })
                        }
                    )
                )
        })
})


module.exports = router