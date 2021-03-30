const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')
const Review = require('../models/Review')

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

        case 'by_rating':
            sortOption = { 'rating': -1 }
            break
        
        case 'by_rating':
            sortOption = { 'rating': 1 }
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
    
    if (req.cookies['uid'] != undefined) {
        res.render('shop/index', {
            productList,
            currentOptions,
            isConnected: true
        })
    } else {
        res.render('shop/index', {
            productList,
            currentOptions
        })
    }


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

    const reviewList = await Review.find({ product: productInfos }).sort({ 'rating': -1 })

    
    console.log(reviewList)

    getRating(productInfos._id)

    if (req.cookies['uid'] != undefined) {
        res.render('shop/productInfos', {
            productInfos, 
            userInfos,
            similarProducts,
            reviewList,
            isConnected: true
        })
    } else {
        res.render('shop/productInfos', {
            productInfos, 
            userInfos,
            similarProducts,
            reviewList
        })
    }


    

    // Product.findOne({
    //     _id: productID
    // }).then(
    //     (productInfos) => {
    //         productType = productInfos.type
    //         infos.push(productInfos)
    //         User.findOne({
    //             _id: productInfos.creator
    //         }).then(
    //             (userInfos) => {
    //                 infos.push(userInfos)
    //             }).then(
    //                 Product.find({ 'type': productType }).limit(4).then(
    //                     (similarProducts) => {
    //                         infos.push(similarProducts)
    //                         res.render('shop/productInfos', {
    //                             productInfos: infos[0],
    //                             userInfos: infos[1],
    //                             similarProducts: infos[2]
    //                         })
    //                     }
    //                 )
    //             )
    //     })
})

router.post('/addReview', async (req, res) => {

    const _uid = req.cookies['uid']
    const r = req.body

    const user = await User.findOne({ _id: _uid })
    const product = await Product.findOne({ _id: r.productID })

    await Product.findOneAndUpdate({ _id: r.productID}, {
        rating: getRating(r.productID)
    })

    new Review({
        product,
        user, 
        rating: r.productRating,
        comment: r.productComment,
        date: getDate()
    }).save()

    res.redirect('/shop')
})


async function getRating(id) {
    const product = await Product.findOne({ _id: id})
    const reviews = await Review.find({ product })
    var ratingCount = 0
    var reviewsCount = 0

    reviews.forEach(element => {
        ratingCount = ratingCount + element.rating
        reviewsCount++
    })

    return parseFloat(ratingCount / reviewsCount)
}
module.exports = router