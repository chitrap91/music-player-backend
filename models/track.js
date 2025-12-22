const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    artist: {
        type: String,
        required: true,
        trim: true
    },

    album: {
        type: String,
        required: true,
        trim: true
    },

    duration: {
        type: Number,
        required: true
    },

    url: {
        type: String,
        required: true
    },

    filePath: {
        type: String
    },

    coverUrl: {
        type: String,
        required: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]

}, { timestamps: true });   

const Track = mongoose.model('Track', trackSchema);
module.exports = Track;
