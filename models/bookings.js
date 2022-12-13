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
    Room_Describtion:{

        type:String,
        required:true

    },
    Check_in:{

        type:Date,
        required:true

    },
    Check_out:{

        type:Date,
        required:true


    }

    

});

//export default mongoose.model('Book',bookingSchema);