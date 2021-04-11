const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Product = require('../models/Product')
const ShoppingCart = require('../models/ShoppingCart')
const CartItem = require('../models/CartItem')

function getDate() {

    const date = new Date().toJSON().split('T')[0]

    let day = date.split('-')[2]
    let month = date.split('-')[1]
    let year = date.split('-')[0]

    return (day + '-' + month + '-' + year)
}

router.get('/login', (req, res) => {
    res.render('user/login')
})

router.get('/register', (req, res) => {
    res.render('user/register')
})

router.post('/registerUser', (req, res) => {

    const newUser = new User({
        username: req.body.registerUsername,
        name: req.body.registerName,
        lastname: req.body.registerLastname,
        address: req.body.registerAddress,
        sex: req.body.registerSex,
        password: req.body.registerPassword,

        bio: '', 

        mail: req.body.registerMail,
        tel: req.body.registerTel,

        isSeller: false,
        isVerified: false,
        group: '',

    })
    
    newUser.save()

    new ShoppingCart({
            user: newUser._id,
            date: getDate(),
            state: 'current'
        }).save()

    res.cookie('uid', newUser._id, {expires: new Date(2069,0,1)})
    res.cookie('uname', newUser.username, {expires: new Date(2069,0,1)})
    res.redirect('/user/profil')
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
        res.cookie('uid', toLogin._id, {expires: new Date(2069,0,1)})
        res.cookie('uname', toLogin.username, {expires: new Date(2069,0,1)})
        res.redirect('/user/profil')
    }
})

router.get('/profil/', async (req, res) => {
    const _uid = req.cookies['uid']

    const user = await User.findOne({ _id: _uid})

    res.redirect('/user/profil/' + user.username)
})

// router.get('/profil/', async (req, res) => {
//     if (req.cookies['uid'] != undefined) {

//         const _uid = req.cookies['uid']

//         const userInfos = await User.findOne({ _id: _uid })
//         const productList = await Product.find({ creator: _uid })
//         const orderList = await ShoppingCart.find({ user: _uid, state: 'done' }).sort({'cartDate': -1})

//         // Get order items
//         let productOrderList = []
        
        
//         const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
//         const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

//         res.render('user/profil', {
//             userInfos,
//             productList,
//             orderList,
//             productOrderList,
//             isConnected: true,
//             itemCount,
//             isUser: true
//         })
//     }
//     else {
//         res.redirect('/')
//     }
// })

router.get('/profil/:id', async (req, res) => {
    const _uid = req.cookies['uid']
    const username = req.params.id

    const userInfos = await User.findOne({ username })
    const productList = await Product.find({ creator: userInfos._id })

    var infos = { userInfos, productList }

    if (_uid != undefined) {
        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        infos = { ...infos, isConnected: true, itemCount}

        if (userInfos._id == _uid) {
            const orderList = await ShoppingCart.find({ user: _uid, state: 'done' })
                .sort({'cartDate': -1})
            let productOrderList = []
            infos = { ...infos, isUser: true, orderList, productOrderList}

            if (userInfos.isAdmin) {
                const pendingAccounts = await User.find({ isPending: true })
                infos = { ...infos, isAdmin: true, pendingAccounts}
            }            
        } 
    }
    res.render('user/profil', infos )
})

router.get('/logout', (req, res) => {
    clearCookies(res)
    res.redirect('/')
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
