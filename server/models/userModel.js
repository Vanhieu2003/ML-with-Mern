const {Schema,model} = require('mongoose')

const userSchema = new Schema ({
    name: {type: String,require:true},
    email: {type: String,require:true},
    password: {type: String,require:true},
    phone: {type: String,require:true},
    address: {type: String,require:true},
    avatar: {type: String},
    posts: {type: Number,default:0},
    isAdmin: {type: Boolean, default: false}, //Thêm trường này
}, {timestamps:true})



module.exports = model('User',userSchema)