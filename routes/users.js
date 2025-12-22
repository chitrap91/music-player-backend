const express = require('express');
const router = express.Router();

const User = require('../models/user');
const verifyToken = require('../middleware/authenticate')

/* GET users listing. */
router.get('/', verifyToken, async (req, res, next) => {

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
router.get('/profile/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

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

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile data"
    })
  }
})




router.get('/recent/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow user to see their own recently played songs
    if (String(req.userId) !== String(id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await User.findById(id).populate('recentlyPlayed');

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ recentSongs: user.recentlyPlayed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:id', verifyToken, async (req, res, next) => {

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

router.get("/likes", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("likes");
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { likes: user.likes } });
  } catch (err) {
    res.status(500).json({ message: "Error fetching likes" });
  }
});









module.exports = router;
