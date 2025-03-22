import User from "../model/User.model.js"
import crypto from "crypto"
import { transporter } from "../utils/mail.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { log } from "console";

const registerUser = async (req, res) => {
    const {name, email, password} = req.body
    
    if (!name || !email || !password) {
        res.status(400).json({
            message:"All fields are required"
        })
    }

    try {
        const existingUser = await User.findOne({email})

        if (existingUser) {
            return res.status(400).json({
                message:"User already exists"  
            })
        }

        const user = await User.create({
            name,
            email,
            password
        })
        console.log(user);
        
        if(!user) {
            return res.status(400).json({
                message:"User not registered",  
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        console.log(token)
        user.verificationToken = token

        await user.save()

        //send mail

        const mailOption = {
        from: process.env.SENDER_EMAIL, // sender address
        to: user.email, // list of receivers
        subject: "Verify Email", // Subject line
        text: `Please click on the following link:
        ${process.env.BASE_URL}:${process.env.PORT}/api/v1/users/verify/${token}`, // plain text body
        
        }

        // const info = await transporter.sendMail({mailOption});
              
        res.status(201).json({
            message: "User registered successfully",
            success: true
            })

    } catch (error) {
        res.status(400).json({
            message:"User not registered",
            error,
            success:false
        });
    }
    //get data
    //validate
    //check if user already exists
    // create a user in database
    // create a verification token
    // save token in database
    // send token as email to user
    // send success status to user
};

const verifyUser = async (req, res) => {
    const { token } = req.params;
    console.log(token);
    
    if (!token) {
        res.status(400).json({
            message:"Invalid token"
        })
    }

    const user = await User.findOne({verificationToken: token});

    if(!user) {
        res.status(400).json({
            message:"Invalid token"
        })
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
        message:"User verified successfully",
        success: true
    })
};

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        res.status(400).json({
            message:"All fields are required"
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({
                message:"User does not exists"
            });
        }
        console.log(user);
        
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({
                message:"Invalid email address or password"
            });
        }
        console.log(isMatch);
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
            }
        );

        console.log(token);
        
        const cookieOptions = {
            httpOnly:true,
            secure:true,
            maxAge:24 * 60 * 60 * 1000
        };

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success:true,
            message:"Login successful",
            token,
            user:{
                id: user._id,
                name:user.name,
                role:user.role,
            },
        });
    } catch (error) {

    }



};

const getMe = async (req, res) => {
    try {
        const {id} = req.user;

        const user = await User.findById(id).select(["-password", "-createdAt", "-updatedAt", "-verificationToken"]);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    } 
}

const logoutUser = async (req, res) => {
    try {
        res.cookie("token", "", {});
        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success:false,
                message:"Please provide an email"
            })
        }
        const user = await User.findOne({email});
        const token = crypto.randomBytes(32).toString("hex");
        
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        user.save();

        //send mail

        const mailOption = {
            from: process.env.SENDER_EMAIL, // sender address
            to: user.email, // list of receivers
            subject: "Forgot Password Email", // Subject line
            text: `Please click on the following link to reset your password:
            ${process.env.BASE_URL}:${process.env.PORT}/api/v1/users/password_reset/${token}`, // plain text body
            
            }
    
            // const info = await transporter.sendMail({mailOption});
            return res.status(200).json({
                success:true,
                message:"Password reset link has been sent to the email"
            })
    } catch (error) {
        console.log("User");
        
    }
};

const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password1, password2}= req.body;
        const now = Date.now();

        console.log(token);

        if (!token) {
            return res.status(400).json({
                success:false,
                message:"Invalid token"
            })
        }

        if (password1!==password2) {
            return res.status(400).json({
                success:false,
                message:"Passwords don't match"
            })
        
        }
        const user = await User.findOne({
            resetPasswordToken: token
        })

        if (!user) {
            
            return res.status(400).json({
                success:false,
                message:"Invalid token"
            })
        }

        if (now > user.resetPasswordExpires) {
            return res.status(400).json({
                success:false,
                message:"URL has expired"
            })
        }

        user.password = password1;
        user.resetPasswordExpires = undefined;
        user.resetPasswordToken = undefined;

        await user.save();

        return res.status(200).json({
            success:true,
            message:"Password reset successful"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
        
    }
};

export { registerUser, verifyUser, loginUser, getMe, logoutUser, forgotPassword, resetPassword };
