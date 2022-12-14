const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const bookingSchema = new Schema({

    UserID:{   
        type:Number, // might make it string
        required:true
    },
    Room_Number:{
        type:Number,
        required:true
    },
    
    Check_in:{

        type:String,
        required:true

    },
    Check_out:{
        type:String,
        required:true
    }

    

});

const booking = mongoose.model('booking',bookingSchema);
module.exports = booking;