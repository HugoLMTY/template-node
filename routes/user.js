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

router.post('/registerUser', (req, res) => {

    const newUser = new User({
        username: req.body.registerUsername,
        name: req.body.registerName,
        lastname: req.body.registerLastName,
        password: req.body.registerPassword,

        address: req.body.registerAddress,
        sex: req.body.registerSex,

        bio: '', 

        mail: req.body.registerMail,
        tel: req.body.registerTel,

        isSeller: false,
        isVerified: false,
        isPending: true,
        pendingDate: new Date(),
        group: '',

        isAdmin: false

    })
    
    newUser.save()

    new ShoppingCart({
            user: newUser._id,
            date: getDate(),
            state: 'current'
        }).save()

    res.cookie('uid', newUser._id, {expires: new Date(2069,0,1)})
    // res.cookie('uname', newUser.username, {expires: new Date(2069,0,1)})
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

    if (_uid != undefined) {
        const user = await User.findOne({ _id: _uid })
        res.redirect('/user/' + user.username)
    } else {
        res.redirect('/')
    }

})

//#region old profil
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
//#endregion

router.get('/action/logout', (req, res) => {
    clearCookies(res)
    res.redirect('/')
})

router.get('/:id', async (req, res) => {

    
    const _uid = req.cookies['uid']
    const username = req.params.id
    
    const userInfos = await User.findOne({ username })
    
    if (userInfos) {
        const title = "Profil de " + userInfos.username
        const productList = await Product.find({ creator: userInfos._id })
        var infos = { title, userInfos, productList }
    } else {
        const title = "Erreur 404"
        var infos = { title, userInfos }
    }




    if (_uid != undefined) {
        const cart = await ShoppingCart.findOne({user: _uid, state: 'current'})
        const itemCount = (await CartItem.distinct('name', { idCart: cart._id })).length

        infos = { ...infos, isConnected: true, itemCount}

        if (userInfos && userInfos._id == _uid) {
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

function clearCookies(res) {
    res.clearCookie('uid')
    // res.clearCookie('uname')
}

module.exports = router 
