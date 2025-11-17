const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user')
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const verifyToken = require('../middleware/authenticate')




/* GET users listing. */
router.post('/register', async (req, res, next) => {
    try {

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        const user = new User(req.body);
        await user.save();
        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        })
    }
});

router.post('/login', async (req, res, next) => {
    try {

        // Accept either email or username for login
        if (!req.body || !(req.body.email || req.body.username) || !req.body.password) {
            return res.status(400).json({ message: 'Email/username and password are required' });
        }
        const { email, username, password } = req.body;
        const query = email ? { email } : { username };
        const user = await User.findOne(query);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // ensure JWT secret is available
        if (!JWT_SECRET_KEY) {
            console.error('JWT_SECRET_KEY is not set. Set it in your environment or .env file.');
            return res.status(500).json({ success: false, message: 'Server misconfiguration' });
        }

        const token = jwt.sign({ _id: user._id }, JWT_SECRET_KEY, { expiresIn: '10h' });
        res.status(200).json({
            success: true,
            token: token,
            userId: user._id
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error logging in user'
        });
    }
})



module.exports = router;

