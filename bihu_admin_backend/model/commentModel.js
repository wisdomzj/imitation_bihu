const mongoose = require('mongoose')

let commentSchema = mongoose.Schema({
  uid:{type:String,ref:'users'},
  avatarUrl:{type:String},
  aid:{type:String,ref:'articles'},
  content:{type:String},
  createTime:{type:Date},
  nickName:{type:String}
})

let commentModel = mongoose.model('comments',commentSchema,'comment')

module.exports = commentModel