const express = require('express')
const app = express()
const expressLayout = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/ydays_db', {
    useNewUrlParser: true  })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Mongoose OK'))

const indexRouter = require('./routes/index')
const userRouter = require('./routes/user')
const shopRouter = require('./routes/shop')
const cartRouter = require('./routes/cart')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layout/layout')
app.use(expressLayout)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(express.static(__dirname + '/assets'))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/user', userRouter)
app.use('/shop', shopRouter)
app.use('/cart', cartRouter)

app.listen(6969, () => console.log('http://localhost:6969'))
