const mongoose = require('mongoose');
const trackShema = new mongoose.Schema({
    title:{
        type: String,
        required:true,
    },

    artist:{
        type:String,
        required:true


    },
    album:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,
        required:true,
    
    },

    url:{
        type:String,
        required:true,      
    }  ,
    coverUrl:{
        type:String,
        required:true,      

    },
    createdAt:{
        type: Date,
        default: Date.now 
       }     
});








  const Track = mongoose.model('Track',trackShema);
  module.exports = Track;