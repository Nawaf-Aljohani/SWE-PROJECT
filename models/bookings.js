const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const bookingSchema = new Schema({

    UserID:{
        
        type:Number,
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
const Booking = mongoose.model('Booking',bookingSchema);
module.exports = Booking;