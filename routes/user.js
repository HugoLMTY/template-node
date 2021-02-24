const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')

router.get('/login', (req, res) => {
    clearCookies(res)
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

router.get('/profil', async (req, res) => {
    if (req.cookies['uid'] != undefined) {
        const _uid = req.cookies['uid']

        userInfos = await User.findOne({
            _id: _uid
        })
        console.log(userInfos)
        res.render('user/profil', {
            userInfos: userInfos
        })
    }
    else
        res.redirect('user/login')
})

router.get('/logout', (req, res) => {
    clearCookies(res)
    res.redirect('/user/login')
})

function clearCookies(res) {
    res.clearCookie('uid')
    res.clearCookie('uname')
}

module.exports = router 
