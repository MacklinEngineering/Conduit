const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET

const verifyJWTOptional = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    console.log("Inside VerifyJWTOptional")

    if (!authHeader || !authHeader?.startsWith('Token ') || !authHeader.split(' ')[1].length) {
        req.loggedin = false;
        return next();
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            req.loggedin = true;
            req.userId = decoded.user.id;
            req.userEmail = decoded.user.email;
            req.userHashedPwd = decoded.user.password;
            next();
        }
    )
};

export default verifyJWTOptional;