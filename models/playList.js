const mongoose= require('mongoose');
const user = require('./user');

const playListSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    
    description:{
        type:String,
        required:false
    }, 
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    }, 
    tracks:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track'
    }],

    createdAt:{
        type: Date,
        default: Date.now 
       }        
})
const PlayList =mongoose.model('PlayList',playListSchema);
module.exports= PlayList;