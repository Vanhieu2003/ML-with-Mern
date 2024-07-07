const {Schema,model} = require('mongoose')

const userSchema = new Schema ({
    name: {type: String,require:true},
    id:{type: String,require:true},
    cccdImage:{type:String},
    email: {type: String,require:true},
    password: {type: String,require:true},
    phone: {type: String,require:true},
    address: {type: String,require:true},
    home: {type: String,require:true},
    sex:{type: String,require:true},
    dob:{type: String,require:true},
    nationality:{type: String,require:true},
    avatar: {type: String},
    posts: {type: Number,default:0},
    isKYC: {type: Boolean, default: false},
    isAdmin: {type: Boolean, default: false}, //Thêm trường này
}, {timestamps:true})



module.exports = model('User',userSchema)