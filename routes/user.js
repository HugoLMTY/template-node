const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Product = require('../models/Product')
const ShoppingCart = require('../models/ShoppingCart')
const CartItem = require('../models/CartItem')

router.get('/login', (req, res) => {
    res.render('user/login')
})

router.get('/register', (req, res) => {
    res.render('user/register')
})

router.post('/registerUser', (req, res) => {
    const newUser = new User({
        name: req.body.registerName,
        mail: req.body.registerMail,
        password: req.body.registerPassword,
        group: req.body.registerGroup,
        tel: req.body.registerTel,
        address: req.body.registerAddress,
        sex: req.body.registerSex
    })
    newUser.save().then(
        res.redirect('login')
    )
})

router.post('/loginUser', async (req, res) => {
    
    let loginInfos = {
        mail: req.body.loginMail
    }
    const toLogin = await User.findOne(loginInfos)
    console.log(toLogin);

    if (!toLogin) {
        res.render('user/login', {
            errorMessage: 'Aucun utilisateur correspondant'
        })
    } else {
        console.log(toLogin._id)
        res.cookie('uid', toLogin._id, {expires: new Date(2069,0,1)})
        res.cookie('uname', toLogin.name, {expires: new Date(2069,0,1)})
        res.redirect('/user/profil')
    }
})

router.get('/profil/', async (req, res) => {
    if (req.cookies['uid'] != undefined) {

        const _uid = req.cookies['uid']

        const productList = await Product.find({ creator: _uid })
        const orderList = await ShoppingCart.find({ user: _uid, state: 'done' }).sort({'cartDate': -1})

        let productOrderList = []

        // orderList.forEach(order => {
        //     productOrderList.push(
        //         CartItem.find({ idCart: order._id }).then()
        //     )
        // })


        console.log(productOrderList)

        userInfos = await User.findOne({
            _id: _uid
        })
        res.render('user/profil', {
            userInfos,
            productList,
            orderList,
            productOrderList,
            isConnected: true
        })
    }
    else {
        res.redirect('/user/login')
    }
})

router.get('/logout', (req, res) => {
    clearCookies(res)
    res.redirect('/user/login')
})

function clearCookies(res) {
    res.clearCookie('uid')
    res.clearCookie('uname')
}


async function getProductListByCartID(id) {
    const list = await CartItem.find({ idCart: id })
    return list
}
module.exports = router 
