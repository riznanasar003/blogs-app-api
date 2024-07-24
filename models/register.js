const mongoose = require ("mongoose")
const schema = mongoose.Schema(
    {
        "name":{type:String,required:true},
        "dob":{type:String,required:true},
        "gender":{type:String,required:true},
        "emailid":{type:String,required:true},
        "pass":{type:String,required:true}
    }
)

const registermodel = mongoose.model("registers",schema);
module.exports = {registermodel}