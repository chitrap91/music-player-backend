const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authenticate')
const Track = require('../models/track');


router.post('/', verifyToken, async (req, res) => {
    try {
        const track = new Track(req.body);
        await track.save();
        res.status(201).json({
            success: true,
            data: track,
            message: "Track added successfully"
        })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error adding track"
        })
    }
})

router.get('/', verifyToken, async (req, res) => {
    try {
        const tracks = await Track.find();
        res.status(200).json({
            success: true,
            data: tracks,
            message: "Tracks fetched successfully"
        })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error fetching tracks"
        })
    }
})

module.exports = router;


