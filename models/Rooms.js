const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const RoomSchema = new Schema({

    name:{
        type:String,
        required:true
    },
    type:{

        type:String,
        required:true

    },

    city:{

        type:String,
        required:true

    },

    address:{

        type:String,
        required:true


    },
    photos:{

        type:[String]
      
    },
    describtion:{

        type:String,
        required:true
    },
    rooms:{

        type:[String]
    },
    Reserved:{
        type:Boolean,
        default:false

    }
    

});

//export default mongoose.model('Room',RoomSchema);