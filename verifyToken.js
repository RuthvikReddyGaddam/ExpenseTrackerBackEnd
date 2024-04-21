const jwt = require('jsonwebtoken');


//middleware function to check if a user sending request is authorized
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token is missing' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is invalid' });
        }
        const userInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(userInfo.exp <= Math.floor(Date.now() / 1000)){
            return res.status(401).json({ message: 'Token is invalid' });
        }
        req.user = userInfo;
        next();
    });
}

module.exports = verifyToken;