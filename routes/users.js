const express = require('express');
const router = express.Router();

const User = require('../models/user');
const verifyToken = require('../middleware/authenticate')

/* GET users listing. */
router.get('/', async (req, res, next) => {

  try {
    const users = await User.find()
    res.status(200).json({
      success: true,
      data: users
    })
  }
  catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message:
        'Error fetching user'
    });
  }

});
router.get('/:id', async (req, res, next) => {

  try {
    const user = await User.findById(
      req.params.id
    )
    res.status(200).json({
      success: true,
      data: user
    })
  }
  catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message:
        'Error fetching user'
    });
  }

});

router.get('/profile/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: user
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      data: user
    });

  }
  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile data"
    })
  }
})







module.exports = router;
