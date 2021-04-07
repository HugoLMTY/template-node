const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const ShoppingCart = require('../models/ShoppingCart')
const CartItem = require('../models/CartItem')

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

        const _uid = req.cookies['uid']
        
        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        res.render('index', {
            latest,
            latest_2,
            latest_3,
            bestseller,
            lowstock, 
            isConnected: true,
            itemCount
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