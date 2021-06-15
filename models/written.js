const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wrtittenSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            index:true
        },
        date:{
            type: String,
            required:true
        },
        subject:{
            type:String,
            required:true
        },
        mainText:{
            type:String,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
    }
);

module.exports = mongoose.model('Written',wrtittenSchema);

