const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Product = require('../models/Product')
const ShoppingCart = require('../models/ShoppingCart')
const CartItem = require('../models/CartItem')


router.post('/validateSeller', async (req, res) => {
    const idUser = req.body.idUser
    await User.findOneAndUpdate({ _id: idUser}, { isPending: false, isSeller: true })
})


router.post('/validateUser', async (req, res) => {
    const idUser = req.body.idUser
    await User.findOneAndUpdate({ _id: idUser}, { isPending: false, isVerified: true})
})


module.exports = router