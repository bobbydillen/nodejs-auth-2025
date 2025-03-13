const User = require('../models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');


//register controller
const registerUser = async(req, res)=>{
    try {
        //extract user info
        console.log("started");
        
        const {username, email, password, role} = req.body;
        //check if already exist
        const checkExistingUser = await User.findOne({$or : [{username}, {email}]});
        if(checkExistingUser){
            return res.status(400).json({
                success : false,
                message : 'User name or email already exists'
            })
        }

         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

         //create a new user

         const newlyCreatedUser = new User({
            username,
            email,
            password: hashedPassword,
            role : role ||'user'
         })

         await newlyCreatedUser.save();
         if(newlyCreatedUser){
            res.status(201).json({
                sucess : true,
                message : 'User Registration Successfull'
            })
         }else{
            return  res.status(400).json({
                sucess : false,
                message : 'Unable to register User'
            })
         }

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success : false,
            message : 'Something Went Wrong'
        })
    }
};

//login controller
const loginUser = async(req, res)=>{
    try {
        const {username, password} = req.body;
        //find if user exists
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({
                success : false,
                message : 'Invalid username'
            })
        }
        //if correct pass
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success : false,
                message : 'Invalid password'
            })
        }

        const accessToken = jwt.sign({
            userId : user._id,
            username : user.username,
            role : user.role
        },process.env.JWT_SECRET_KEY,{
            expiresIn : '30m'
        })
        res.status(200).json({
            success : true,
            message : 'Logged in Successfully',
            accessToken : accessToken
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success : false,
            message : 'Something Went Wrong'
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const userId = req.userInfo.userId;
        const { oldpassword, newpassword } = req.body;

        // Validate input
        if (!oldpassword || !newpassword) {
            return res.status(400).json({
                success: false,
                message: 'Old and new passwords are required'
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user || !user.password) {
            return res.status(404).json({
                success: false,
                message: 'User not found or password missing'
            });
        }

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(oldpassword, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect old password'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newpassword, salt);

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please log in again.'
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { registerUser, loginUser, changePassword};
