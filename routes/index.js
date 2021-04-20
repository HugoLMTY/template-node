const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const ShoppingCart = require('../models/ShoppingCart')
const CartItem = require('../models/CartItem')
const User = require('../models/User')

router.get('/', async (req, res) => { 

    const title = 'Accueil'

    const limit = 3

    const latest = 
        await Product
            .find({ isActive: true })
            .sort({ 'uploadDate': -1 })
            .limit(limit)
            
    const latest_2 = 
        await Product
            .find({ isActive: true })
            .sort({'uploadDate': -1})
            .limit(limit)
            .skip(limit)
    
    const latest_3 = 
        await Product
            .find({ isActive: true })
            .sort({'uploadDate': -1})
            .limit(limit)
            .skip(limit * 2)

    const bestseller = 
        await Product
            .find({ isActive: true })
            .sort({'rating': -1})
            .limit(limit + 2)

    const lowstock = 
        await Product
            .find({ qty: { $gte: 1 }, isActive: true })
            .sort('qty')
            .limit(limit)
   
    var infos = { title, latest, latest_2, latest_3, bestseller, lowstock }

    if (req.cookies['uid'] != undefined) {
        const _uid = req.cookies['uid']

        const cart = await ShoppingCart.findOne({ user: _uid, state: 'current' })
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        infos = { ...infos, isConnected:true, itemCount }
    }

    res.render('index', infos)
})

module.exports = router 