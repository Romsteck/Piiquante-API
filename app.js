const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()

const userRoutes = require('./routes/user')
const saucesRoutes = require('./routes/sauces')

const app = express()
app.use(express.json())

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    next()
})

mongoose.set('strictQuery', false)
mongoose.connect(
    `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASSWORD}@${process.env.MONGODB_ADDRESS}/?retryWrites=true&w=majority`,
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
)
.then(()=>console.log('Connexion à MongoDB Réussie'))
.catch(()=>console.log('Connexion à MongoDB échouée'))

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/api/auth', userRoutes)
app.use('/api/sauces', saucesRoutes)

module.exports = app