const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')

function getDate() {

    const date = new Date().toJSON().split('T')[0]
    
    let day = date.split('-')[2]
    let month = date.split('-')[1]
    let year = date.split('-')[0]

    return(day + '-' + month + '-' + year)
}

router.get('/', async (req, res) => {
    const r = req.query
    
    let currentOptions = {}

    let searchOptions = {}
    let sortOption = {}


    // ------------  NAME  ------------------------------------
    if (r.productFilterName)
        searchOptions.name = r.productFilterName

    // ------------ SORT ---------------------------------------

    switch (r.productFilterSort) {
        case 'by_name':
            sortOption = {'name': -1}
            break
        
        case 'by_name_': 
            sortOption = {'name': 1}
            break

        case 'by_name':
            sortOption = {'name': -1}
            break
        
        case 'by_name_': 
            sortOption = {'name': 1}
            break

        case 'by_name':
            sortOption = {'name': -1}
            break
        
        case 'by_name_': 
            sortOption = {'name': 1}
            break
    
    }

    // ------------  PRICE  ------------------------------------
    if (r.productFilterMinPrice && r.productFilterMaxPrice)
    {
        searchOptions.price = {
            $gte: r.productFilterMinPrice,
            $lte: r.productFilterMaxPrice
        }
        currentOptions.minPrice = parseInt(r.productFilterMinPrice)
        currentOptions.maxPrice = parseInt(r.productFilterMaxPrice)
    } 
    else if (r.productFilterMinPrice) {
        searchOptions.price = { $gte: r.productFilterMinPrice }    
        currentOptions.minPrice = parseInt(r.productFilterMinPrice)
    }
    else if (r.productFilterMaxPrice){
        searchOptions.price = { $lte: r.productFilterMaxPrice }
        currentOptions.maxPrice = parseInt(r.productFilterMaxPrice)
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

    
    currentOptions = searchOptions

    // console.log(currentOptions)


    Product.find(searchOptions).sort(sortOption).then(
        (productList) => {
            res.render('shop/index', {
                productList: productList,
                currentOptions: currentOptions
            })
        })

})

router.get('/addProduct', (req, res) => {

    const _uid = req.cookies['uid']
    try {
        User.findOne({'_id': _uid}).then(
            (userInfos) => {
                res.render('shop/newProduct', {
                    userInfos: userInfos,
                    date: getDate()
                })
        })
    } catch {
        res.redirect('/shop/')
    }
})

router.post('/new', (req, res) => {

    const newProduct = new Product({
        name: 'prod1',
        price: 39,
        creator: '6036577f14b1bb7df44bfa0b',
        uploadDate: getDate(),
        desc: 'product desc',
        qty: 42, 
        type: 'item',
        pathImg: 'samplePrint_3.jpg',
        height: '11',
        width: '12',
        lenght: '12',
    })
    res.send(newProduct)
    // newProduct.save().then(
    //     res.redirect('/shop/')
    // )
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

    try {
        const productList = await Product.find(searchOptions)
        res.render('shop/index', {
            productList: productList
        })
    } catch(e) {
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
                Product.find({ 'type': productType}).limit(4).then(
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