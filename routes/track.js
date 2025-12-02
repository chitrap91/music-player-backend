const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');

const verifyToken = require('../middleware/authenticate')
const Track = require('../models/track');



router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, artist, album } = req.body;

        // 1️⃣ Validate required fields
        if (!title || !artist) {
            return res.status(400).json({
                success: false,
                message: "Title and artist are required"
            });
        }

        // 2️⃣ Check if track already exists (avoid duplicates)
        const existingTrack = await Track.findOne({ title, artist, album });

        if (existingTrack) {
            return res.status(400).json({
                success: false,
                message: "Track already exists",
                data: existingTrack
            });
        }

        // 3️⃣ Create new track
        const track = new Track(req.body);
        await track.save();

        res.status(201).json({
            success: true,
            message: "Track added successfully",
            data: track
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error adding track"
        });
    }
});




router.get('/', verifyToken, async (req, res) => {

    try {
        const page = Number(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        const query = search
            ? {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { artist: { $regex: search, $options: "i" } },
                    { album: { $regex: search, $options: "i" } }
                ],
            } : {};

        const totalTracks = await Track.countDocuments(query);
        const totalPages = Math.ceil(totalTracks / limit);

        const tracks = await Track.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
        res.status(200).json({
            success: true,
            data: tracks, page, limit, search, totalPages,
            totalTracks,
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

router.get("/download/:id", verifyToken, async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);
        if (!track) {
            return res.status(404).json({
                success: false,
                message: "Track not found"
            });
        }       

        const filePath = track.filePath;
        res.download(filePath, (err) => {
            if (err) {
                console.log("Error downloading file:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error downloading file"
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error processing download"
        });
    }
}); 
router.post('/recent', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const { trackId } = req.body;

        if (!trackId) {
            return res.status(400).json({
                success: false,
                message: "trackId is required"
            });
        }

        // validate track id
        if (!mongoose.Types.ObjectId.isValid(trackId)) {
            return res.status(400).json({ success: false, message: 'Invalid trackId' });
        }

        // confirm track exists
        const trackExists = await Track.findById(trackId);
        if (!trackExists) {
            return res.status(404).json({ success: false, message: 'Track not found' });
        }

        // Ensure the user exists
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Ensure recentlyPlayed exists
        if (!Array.isArray(user.recentlyPlayed)) {
            user.recentlyPlayed = [];
        }


        // Remove the track if it already exists (use trackId from request)
        user.recentlyPlayed = user.recentlyPlayed.filter(
            id => id.toString() !== trackId.toString()
        );

        // Add the track to the start of the array
        user.recentlyPlayed.unshift(trackId);

        // Keep last 20 songs only
        if (user.recentlyPlayed.length > 20) user.recentlyPlayed.pop();

        await user.save();
        res.json({ success: true, message: "Song added to recently played", data: user.recentlyPlayed });
    } catch (err) {
        console.error('Error in POST /track/recent:', err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;


