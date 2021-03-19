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

    return(day + '-' + month + '-' + year)
}



router.get('/', async (req, res) => {
    const _uid = req.cookies['uid']

    let itemList = []

    const shoppingCartInfos = await ShoppingCart.findOne({ user: _uid, state: 'current' })

    const cartList = await CartItem.find({ idCart: shoppingCartInfos._id })
    cartList.forEach(element => {
        itemList.push(element.idProduct)
    });

    const productInfos = await Product.find({ _id: { $in: itemList } })

    const cartInfos = ({
        name: productInfos.name,
        priceU: productInfos.price,
        pathImg: productInfos.pathImg,
        
    })
    
    res.render('cart/index', {
        itemList: productInfos,
        cartInfos: shoppingCartInfos
    })
    
    // Create shoppingcart is user doesnt have one //
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
    const productInfos = await Product.findOne({ _id: req.body.productID })


    ShoppingCart.findOne({ user: _uid}).then(
        (result) => {
            new CartItem ({
                name: productInfos.name,
                totalPrice: 0,
                // totalPrice: getCartTotalPrice(_uid, result),
                qty: req.body.cartQty,
                idCart: result._id,
                idProduct: productInfos._id
            }).save()
        })
})

router.post('/cartAction', async (req, res) => {
    const _uid = req.cookies['uid']

    ShoppingCart.findOne({ user: _uid  }).then(
        (result) => {
            // res.send(result)
            console.log('id: ', req.body.cartProductID)
            CartItem.find({ idCart: result._id, _id: req.body.cartProductID }).then(
                (result) => {
                    res.redirect('/cart/')
                }
            )
        }
    )
})

async function getCartTotalPrice(_uid, toAdd) {
    const productList = await ShoppingCart.findOne({ user: _uid}).then(
        (result) => {
            cartItem.find({ idCart: result._id }).then(
                    (cartList) => {
                        console.log(cartList)
                })
        })
}

module.exports = router 