const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')
const Review = require('../models/Review')
const ShoppingCart = require('../models/ShoppingCart')
const CartItem = require('../models/CartItem')

const multer = require('multer')
const path = require('path')
const uploadPath = path.join('assets/img', Product.imgPath)

const imgType = ['image/jpeg', 'image/png', 'image/jpg']

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imgType.includes(file.mimetype))
    }
})

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

    const sortValues = [
        [{"name":"Nom ↓"}, {"value": "by_name_desc"}],
        [{"name":"Nom ↑"}, {"value": "by_name_asc"}],

        [{"name":"Prix ↓"}, {"value": "by_price_desc"}],
        [{"name":"Prix ↑"}, {"value": "by_price_asc"}],

        [{"name":"Upload ↓"}, {"value": "by_upload_desc"}],
        [{"name":"Upload ↑"}, {"value": "by_upload_asc"}],

        [{"name":"Qté ↓"}, {"value": "by_qty_desc"}],
        [{"name":"Qté ↑"}, {"value": "by_qty_asc"}],

        [{"name":"Note ↓"}, {"value": "by_rating_desc"}],
        [{"name":"Note ↑"}, {"value": "by_rating_asc"}],
    ]

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

    const title = "Boutique"

    var infos = { title, sortValues, productList, currentOptions }

    if (req.cookies['uid'] != undefined) {
        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        infos = { ...infos, isConnected: true, itemCount}
    }
    res.render('shop/index', infos)
})

router.get('/addProduct', async (req, res) => {

    const _uid = req.cookies['uid']
    try {
        const userInfos = await User.findOne({ _id: _uid})

        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        const title = "Nouveau produit"

        const infos = { title, userInfos, date: getDate(), isConnected: true, itemCount}

        res.render('shop/newProduct', infos)
    } catch {
        res.redirect('/shop/')
    }
})

router.post('/new', upload.single('pathImgProduct'), (req, res) => {

    const _uid = req.cookies['uid']
    const r = req.body

    const filename = req.file != null ? req.file.filename : null

    const newProduct = new Product({
        name: r.newProductName,
        price: r.newProductPrice,
        desc: r.newProductDesc,
        
        pathImg: filename,
        
        uploadDate: getDate(),
        qty: r.newProductQty,
        rating: 0,
        creator: _uid,
        
        type: 'item',
        
        width: r.newProductWidth,
        height: r.newProductHeight,
        lenght: r.newProducLength,
        
        weight: r.newProducWeight
    })

    newProduct.save()

    res.redirect('/shop')
})

router.get('/product/:id', async (req, res) => {
    const productID = req.params.id

    const productInfos = await Product.findOne({ _id: productID })
    const userInfos = await User.findOne({ _id: productInfos.creator })
    const similarProducts = await Product.find({ type: productInfos.type }).limit(4)

    const reviewList = await Review.find({ product: productInfos._id }).sort({ 'rating': -1 }).limit(3)
    const reviewListMore = await Review.find({ product: productInfos._id }).sort({ 'rating': -1 }).skip(3)

    const title = productInfos.name

    var infos = { title, productInfos, userInfos, similarProducts, reviewList, reviewListMore } 

    if (req.cookies['uid'] != undefined) {

        const _uid = req.cookies['uid']
        
        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length
        
        if (_uid == userInfos._id) {
            infos = { ...infos, isConnected: true, itemCount, isCreator: true }     

        } else {
            const previousCarts = await ShoppingCart.find({ user: _uid, state: 'done' })
            let cartID = []
            var canReview = false
            var hasReviewed = false

            previousCarts.forEach(cart => { 
                cartID.push(cart._id) 
            })
            if (await CartItem.countDocuments({ idProduct: productID, idCart: { $in: cartID} }) > 0) 
                canReview = true
 
            if (await Review.countDocuments({ user: _uid, product: productID }) > 0) 
                hasReviewed = true 

            infos = { ...infos, isConnected: true, itemCount, canReview, hasReviewed }
        }
    } 
    res.render('shop/productInfos', infos )
})

router.post('/addReview', async (req, res) => {

    const _uid = req.cookies['uid']
    const r = req.body

    new Review({
        product: r.productID,
        user: _uid, 
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