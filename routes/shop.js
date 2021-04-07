const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')
const Review = require('../models/Review')
const ShoppingCart = require('../models/ShoppingCart')
const CartItem = require('../models/CartItem')

function getDate() {

    const date = new Date().toJSON().split('T')[0]

    let day = date.split('-')[2]
    let month = date.split('-')[1]
    let year = date.split('-')[0]

    return (day + '-' + month + '-' + year)
}

router.get('/', async (req, res) => {
    const _uid = req.cookies['uid']
    const r = req.query

    let currentOptions = r
    console.log(currentOptions)
    let searchOptions = {}
    let sortOption = {}


    // ------------  NAME  ------------------------------------
    if (r.productFilterName)
        searchOptions.name = r.productFilterName

    // ------------ SORT ---------------------------------------

    switch (r.productFilterSort) {

        case '/':
            sortOption =  {}
            break

        case 'by_name_asc':
            sortOption = { 'name': -1 }
            break

        case 'by_name_desc':
            sortOption = { 'name': 1 }
            break

        case 'by_price_asc':
            sortOption = { 'price': 1 }
            break

        case 'by_price_desc':
            sortOption = { 'price': -1 }
            break

        case 'by_upload_asc':
            sortOption = { 'uploadDate': 1 }
            break

        case 'by_upload_desc':
            sortOption = { 'uploadDate': 1 }
            break
            
        case 'by_qty_asc':
            sortOption = { 'qty': -1 }
            break

        case 'by_qty_desc':
            sortOption = { 'qty': 1 }
            break

        case 'by_rating_asc':
            sortOption = { 'rating': 1 }
            break
        
        case 'by_rating_desc':
            sortOption = { 'rating': -1 }
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


    const productList = await Product.find(searchOptions).sort(sortOption)
    
    // console.log(productList)

    if (req.cookies['uid'] != undefined) {
        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        res.render('shop/index', {
            productList,
            currentOptions,
            isConnected: true,
            itemCount
        })
    } else {
        res.render('shop/index', {
            productList,
            currentOptions
        })
    }


})

router.get('/addProduct', async (req, res) => {

    const _uid = req.cookies['uid']
    try {

        const userInfos = await User.findOne({ _id: _uid})

        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        res.render('shop/newProduct', {
            userInfos, 
            date: getDate(),
            isConnected: true,
            itemCount
        })
    } catch {
        res.redirect('/shop/')
    }
})

router.post('/new', (req, res) => {

    const _uid = req.cookies['uid']
    const r = req.body

    new Product({
        name: r.newProductName,
        price: r.newProductPrice,
        creator: _uid,
        uploadDate: getDate(),
        desc: r.newProductDesc,
        qty: r.newProductQty,
        type: 'item',
        rating: 0.5,
        pathImg: r.pathImgProduct,
        width: r.newProductWidth,
        height: r.newProductHeight,
        lenght: r.newProducLength,
        weight: r.newProducWeight
    }).save()
    res.redirect('/shop/')
})

router.get('/product/:id', async (req, res) => {
    const productID = req.params.id

    const productInfos = await Product.findOne({ _id: productID })
    const userInfos = await User.findOne({ _id: productInfos.creator })
    const similarProducts = await Product.find({ type: productInfos.type }).limit(4)

    const reviewList = await Review.find({ product: productInfos._id }).sort({ 'rating': -1 }).limit(3)
    const reviewListMore = await Review.find({ product: productInfos._id }).sort({ 'rating': -1 }).skip(3)

    if (req.cookies['uid'] != undefined) {

        const _uid = req.cookies['uid']
        
        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        if (_uid == userInfos._id) {
            res.render('shop/productInfos', {
                productInfos, 
                userInfos,
                similarProducts,
                reviewList,
                reviewListMore,
                isConnected: true, 
                itemCount,
                isCreator: true,
            })
        } else {
            res.render('shop/productInfos', {
                productInfos, 
                userInfos,
                similarProducts,
                reviewList,
                reviewListMore,
                isConnected: true, 
                itemCount
            })
        }

    } else {
        res.render('shop/productInfos', {
            productInfos, 
            userInfos,
            similarProducts,
            reviewList
        })
    }
})

router.post('/addReview', async (req, res) => {

    const _uid = req.cookies['uid']
    const r = req.body

    console.log(r)

    const user = await User.findOne({ _id: _uid })

    new Review({
        product: r.productID,
        user, 
        rating: parseInt(r.productRating),
        comment: r.productComment,
        date: getDate()
    }).save()

    setRating(r.productID)

    res.redirect('/shop/product/' + r.productID)
})

async function setRating(product) {
    const reviews = await Review.find({ product })
    var ratingCount = 0
    var reviewsCount = 0

    reviews.forEach(element => {
        ratingCount = ratingCount + element.rating
        reviewsCount++
    })
    
    await Product.findOneAndUpdate({ _id: product }, { rating: Math.round(parseInt(ratingCount / reviewsCount))})
}


module.exports = router