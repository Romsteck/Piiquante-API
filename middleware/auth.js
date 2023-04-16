const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    console.log(process.env.JSON_TOKEN)

    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
        req.auth = {
            userId: decodedToken.userId
        }
    next()
    } catch(error) {
        res.status(401).json({ error })
    }
}