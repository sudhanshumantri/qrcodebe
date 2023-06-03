const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const qrcodeSchema = new Schema({
    name : {
       type : String
    },
    status: {
      type: String
    },
    phone : {
       type: Number,
       unique:true,
       require:true
    },
    isScaneDone: {
      type: Boolean
    },
    qrCode:{
      type: String
    }
},
{
   collection: 'qrcode'
    
}
);

module.exports = mongoose.model('qrcode', qrcodeSchema)