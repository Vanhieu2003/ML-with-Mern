const { Schema,model} = require('mongoose')

const postSchema = new Schema ({
    title: {type: String,require:true},
    description: {type: String,require:true},
    category: {type: String,default: 'uncategorized'},
    creator: {type: Schema.Types.ObjectId,ref:"User"},
    thumbnail: {type: String,require:true},
}, {timestamps:true})

module.exports = model("Post",postSchema)