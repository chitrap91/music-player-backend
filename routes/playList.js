const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authenticate');
const PlayList = require('../models/playList');

// ---------------- CREATE PLAYLIST ----------------
router.post('/', verifyToken, async (req, res) => {
    try {
        req.body.user = req.userId;

        const playList = new PlayList(req.body);
        await playList.save();

        res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            data: playList
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error creating playlist"
        });
    }
});


// ---------------- GET ALL PLAYLISTS ----------------
router.get('/', verifyToken, async (req, res) => {
    try {
        const playList = await PlayList
            .find({ user: req.userId }) // <-- Each user sees only their playlists
            .populate('tracks')
            .populate('user', '-password');

        res.status(200).json({
            success: true,
            data: playList
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error fetching playlists"
        });
    }
});


// ---------------- GET ONE PLAYLIST ----------------
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const playList = await PlayList
            .findById(req.params.id)
            .populate('tracks')
            .populate('user', '-password');

        if (!playList) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        res.status(200).json({
            success: true,
            data: playList
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error fetching playlist"
        });
    }
});


// ---------------- UPDATE PLAYLIST ----------------
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const playList = await PlayList.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Playlist updated successfully",
            data: playList
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error updating playlist"
        });
    }
});


// ---------------- DELETE PLAYLIST ----------------
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await PlayList.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Playlist deleted successfully"
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error deleting playlist"
        });
    }
});


// ---------------- ADD TRACK TO PLAYLIST ----------------
router.post("/:id/add-track", verifyToken, async (req, res) => {
    try {
        const { trackId } = req.body;

        if (!trackId) {
            return res.status(400).json({
                success: false,
                message: "trackId is required"
            });
        }

        const playList = await PlayList.findById(req.params.id);

        if (!playList) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        // Prevent duplicate track
        if (playList.tracks.includes(trackId)) {
            return res.status(400).json({
                success: false,
                message: "Track already in playlist"
            });
        }

        playList.tracks.push(trackId);
        await playList.save();

        res.status(200).json({
            success: true,
            message: "Track added successfully",
            data: playList
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error adding track"
        });
    }
});


// ---------------- REMOVE TRACK FROM PLAYLIST ----------------
router.delete("/:id/remove-track", verifyToken, async (req, res) => {
    try {
        const { trackId } = req.body;

        const playlist = await PlayList.findByIdAndUpdate(
            req.params.id,
            { $pull: { tracks: trackId } },
            { new: true }
        );

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found"
            });
        }

        res.json({
            success: true,
            message: "Track removed",
            data: playlist
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error removing track"
        });
    }
});

module.exports = router;
