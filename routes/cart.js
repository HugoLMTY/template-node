const express = require('express')
const router = express.Router()

const Product = require('../models/Product')
const CartItem = require('../models/CartItem')
const ShoppingCart = require('../models/ShoppingCart')

function getDate() {

    const date = new Date().toJSON().split('T')[0]

    let day = date.split('-')[2]
    let month = date.split('-')[1]
    let year = date.split('-')[0]

    return (day + '-' + month + '-' + year)
}

router.get('/', async (req, res) => {
    const _uid = req.cookies['uid']

    const shoppingCartInfos = await ShoppingCart.findOne({ user: _uid, state: 'current' })

    if (shoppingCartInfos === null) {
        new ShoppingCart({
            user: _uid,
            cartDate: getDate(),
            state: 'current'
        }).save()
        res.render('cart/index', {
            cartList: [],
            isConnected: true
        })
    } else {
        const cartList = await CartItem.find({ idCart: shoppingCartInfos._id })
        
        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        res.render('cart/index', {
            cartList,
            isConnected: true,
            itemCount
        })
    }
})

router.post('/addProduct', async (req, res) => {
    const _uid = req.cookies['uid']

    const shoppingCart = await ShoppingCart.findOne({ user: _uid, state: 'current'})
    const productInfos = await Product.findOne({ _id: req.body.productID })
    let checkIfExists = {}
    
    checkIfExists = await CartItem.find({ idCart: shoppingCart._id, idProduct: productInfos._id })
    
    if (checkIfExists.length > 0) {

        const updateQty = req.body.cartQty
        const oldQty = checkIfExists[0].qty

        const qty = parseInt(updateQty) + parseInt(oldQty)
        const totalPrice = qty * checkIfExists[0].product.price

        await CartItem.findOneAndUpdate({ 
            idCart: shoppingCart._id, 
            idProduct: productInfos._id }, 
            { 
                qty, 
                totalPrice 
            })

    } else {
        ShoppingCart.findOne({ user: _uid, state: 'current' }).then(
            (result) => {
                new CartItem({
                    name: productInfos.name,
                    product: productInfos,
                    totalPrice: productInfos.price * req.body.cartQty,
                    // totalPrice: getCartTotalPrice(_uid, result),
                    qty: req.body.cartQty,
                    idCart: result._id,
                    idProduct: productInfos._id
                }).save()
            })
    }
    res.redirect('/cart')
})

router.post('/cartAction', async (req, res) => {
    const _uid = req.cookies['uid']
    const r = req.body

    console.log('id: ', r.cartProductID)
    console.log('action: ', r.cartActionSubmit )

    const shoppingCart = await ShoppingCart.findOne({ user: _uid, state: 'current'})
    console.log(shoppingCart)


    switch(req.body.cartActionSubmit) {
        case 'delete':
            await CartItem.findOneAndDelete({ _id: r.cartProductID })
            break;

        case 'update':
            const product = await CartItem.findOne({ _id: r.cartProductID})
            await CartItem.findOneAndUpdate(
                { _id: r.cartProductID }, 
                { 
                    qty: r.newQty,
                    totalPrice: r.newQty * product.product.price 
                })
            break;
    }
    res.redirect('/cart')
})

router.post('/cartPayment', async (req, res) => {
    const _uid = req.cookies['uid']
    
    const cart = await ShoppingCart.findOneAndUpdate({
        user: _uid,
        state: 'current'
    }, {
        state: 'done'
    })

    console.log(cart)

    res.redirect('/user/profil')
})


module.exports = router 