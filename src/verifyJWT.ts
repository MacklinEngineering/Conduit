// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken'
const SECRET = process.env.SECRET as string

const verifyJWT = (req, res, next) => {
    // console.log("REQUEST Headers", req.headers)


    console.log("REQUEST", Object.keys(req))
    console.log()
    if(!req.headers) {
        
        return res.status(200).json({ message: 'Test Authorization - No Headers' })
    }
    const authHeader = req.headers.authorization || req.headers.Authorization
    console.log("AUTH HEADER: ", authHeader)
    console.log("req.headers.authorization: ",req.headers.authorization)
    console.log("req.headers.Authorization: ", req.headers.Authorization)


    if (!authHeader?.startsWith('Token ')) {
        return res.status(401).json({ message: 'OOP GIRL NOT AUTHORIZED' }) //'Unauthorized'
    }
    //Perry said Query Couchbase for the user object that is associated with that token
    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            req.userId = decoded.user.id;
            console.log("REQUEST USERID", req.userId)//undefined
            req.userEmail = decoded.user.email;
            console.log(req.userEmail)
            req.userHashedPwd = decoded.user.password;
            console.log(req.userHashedPwd)
            next();
        }
    )
    
};

export default verifyJWT;