const express = require('express');
const router = express.Router();
const verifyToken = require( '../middleware/authenticate')
const PlayList = require('../models/playList');

router.post('/', verifyToken, async(req,res)=>{
    try{
       req.body.user = req.userId;
       
        const playList = new PlayList(req.body);
        await playList.save();
        res.status(201).json({
            success:true,
            message:"Playlist created Successfully",
            data: playList
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Error creating playlist"
        })      
    }
})

router.get('/',verifyToken,async(req,res)=>{
    try{
        const playList= await PlayList.find().populate('tracks').populate('user','-password');
        res.status(200).json({
            success:true,
            data:playList
        })  
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Error fetching playlists"
        })
    }
})

router.get('/:id',verifyToken,async(req,res)=>{
    try{
        const playList= await PlayList.find(
            {_id:req.params.id}
        ).populate('tracks').populate('user','-password');
        res.status(200).json({
            success:true,
            data:playList
        })  
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Error fetching playlists"
        })
    }
})

router.put('/:id',verifyToken,async(req,res)=>{
    try{
        const playList = await PlayList.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );
        res.status(200).json({
            success:true,
            message:"Playlist updated successfully",
            data:playList
        }
        )
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Error updating playlist"
        })
    }
})

router.delete('/:id',verifyToken,async(req,res)=>{
    try{
        await PlayList.findByIdAndDelete(
            req.params.id
        );
        res.status(200).json({
            success:true,
            message:"Playlist deleted successfully"
        })
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Error deleting playlist"
        })
    }
})


module.exports = router;