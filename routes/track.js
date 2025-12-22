const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');

const verifyToken = require('../middleware/authenticate')
const Track = require('../models/track');
const https = require("https")


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
        console.log("Download request received:", req.params.id);

        if (!track) {
            return res.status(404).json({
                success: false,
                message: "Track not found"
            });
        }

        const fileUrl = track.url; // S3 URL

        // Stream the file from S3 to client
        https.get(fileUrl, (s3Stream) => {
            if (s3Stream.statusCode !== 200) {
                return res.status(500).json({
                    success: false,
                    message: "Error fetching file from S3"
                });
            }

            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Disposition", `attachment; filename="${track.title}.mp3"`);

            s3Stream.pipe(res);
        }).on("error", (err) => {
            console.error("S3 Streaming Error:", err);
            res.status(500).json({
                success: false,
                message: "Error streaming file",
                error: err.message
            });
        });

    } catch (error) {
        console.error("Download Route Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
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

router.post("/:id/like", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const trackId = req.params.id;

        const track = await Track.findById(trackId);

        if (!track) {
            return res.status(404).json({
                success: false,
                message: "Track not found"
            });
        }

        // CLEAN null values in likes
        track.likes = track.likes.filter(id => id !== null);

        const alreadyLiked = track.likes.some(id => id.toString() === userId);

        if (alreadyLiked) {
            // Unlike
            track.likes = track.likes.filter(id => id && id.toString() !== userId);
        } else {
            // Like
            track.likes.push(userId);
        }

        await track.save();

        return res.status(200).json({
            success: true,
            liked: !alreadyLiked,
            likesCount: track.likes.length
        });

    } catch (error) {
        console.error("Error in POST /:id/like:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

//Add Comment to Track
router.post("/:id/comments", verifyToken, async (req, res) => {
    try {
        const track = await Track.findById(req.params.id).populate("comments.user", "username email");


        if (!track) {
            return res.status(404).json({
                success: false,
                message: "Track not found"
            });
        }

        const { comment } = req.body;
        if (!comment || comment.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Comment text is required"
            });
        }

        const newComment = {
            user: req.userId,
            text: comment.trim(),
            createdAt: new Date()
        };

        track.comments.push(newComment);
        await track.save();
        res.status(200).json({
            success: true,
            message: "Comment added successfully",
            data: newComment
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error adding comment"
        });
    }
})

router.get("/:id", verifyToken, async (req, res) => {
    try {
        const track = await Track.findById(req.params.id).populate('likes', '_id').populate("comments.user", "username email");
        if (!track) {
            return res.status(404).json({ success: false, message: "Track not found" });
        }
        res.status(200).json({ success: true, data: track });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching track" });
    }
});

module.exports = router;


