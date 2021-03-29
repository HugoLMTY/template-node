const express = require('express')
const router = express.Router()

const Product = require('../models/Product')
const CartItem = require('../models/CartItem')
const ShoppingCart = require('../models/ShoppingCart')

router.get('/', async (req, res) => {
    const _uid = req.cookies['uid']

    const shoppingCartInfos = await ShoppingCart.findOne({ user: _uid, state: 'current' })

    const cartList = await CartItem.find({ idCart: shoppingCartInfos._id })

    // const productInfos = await Product.find({ _id: { $in: itemList } })

    // const cartInfos = ({
    //     name: productInfos.name,
    //     priceU: productInfos.price,
    //     pathImg: productInfos.pathImg,
        
    // })
    
    res.render('cart/index', {
        cartList
    })
    
    // Create shoppingcart  //
    // const productInfos = await ShoppingCart.findOne({ user: _uid }).then(
    //     (result) => {
    //         if (result.length < 1) 
    //         {
    //             new ShoppingCart({
    //                 price: 0,
    //                 user: _uid,
    //                 cartDate: getDate(),
    //                 state: 'created'
    //             }).save()
    //         }
    //         else 
    //         {
    //             const productList = CartItem.find({ idCart: result._id}).then(
    //                 (result) => {
    //                     result.forEach(element => {        
    //                         Product.findOne({ _id: element.idProduct }).then(
    //                             (result) => {
    //                                 itemList.push(result)
    //                             })
    //                     })
    //                 })
    //         }
    //     })
    //     res.render('cart/', { 
    //         itemList: productList
    //     })
})

router.post('/addProduct', async (req, res) => {
    const _uid = req.cookies['uid']

    const shoppingCart = await ShoppingCart.findOne({ user: _uid})
    const productInfos = await Product.findOne({ _id: req.body.productID })
    let checkIfExists = {}

    
    checkIfExists = await CartItem.find({ idCart: shoppingCart._id, idProduct: productInfos._id })
    
    if (checkIfExists) {

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
        ShoppingCart.findOne({ user: _uid }).then(
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

    const shoppingCart = await ShoppingCart.findOne({ user: _uid})
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


module.exports = router 