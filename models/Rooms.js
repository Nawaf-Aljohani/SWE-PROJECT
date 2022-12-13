const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const RoomSchema = new Schema({

    roomNum:{
        type:Number
    },
    discribtion:{
        type:String,
        required:true

    },
    type:{

        type:String,
        required:true

    },  
    Reserved:{
        type:Boolean,
        default:false

    }
    

});

const Room = mongoose.model('Room',RoomSchema);
module.exports = Room;