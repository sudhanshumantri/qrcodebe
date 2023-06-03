const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
},
{
   collection: 'user'
    
}
);

module.exports = mongoose.model('user', userSchema)