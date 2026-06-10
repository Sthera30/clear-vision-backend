import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const protect = async (req, res, next) => {

    try {

        const token = req.cookies.token

        

        if (!token) {
            return res.status(200).json({ error: 'Invalid token!', success: false })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET)

        req.user = {email: decode.email}

        next()

    } catch (error) {
        console.log(error);
        return res.status(200).json({ error: 'Authentication Error!', success: false })
    }

}