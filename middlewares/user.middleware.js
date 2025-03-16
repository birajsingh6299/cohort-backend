import jwt from "jsonwebtoken"

const isLoggedIn = async (req, res, next) => {
    try {
        console.log(req.cookies);
        
        const token = req.cookies?.token;

        console.log("Token found: ", token ? "YES" : "NO");
        
        if (!token) {
            console.log("No token");
            return res.status(401).json({
                success: false,
                message: "Authentication failed",
            })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        console.log(decode);
        
        next();
    } catch(error) {
        console.log(error);
        
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })       
    }
};

export { isLoggedIn };