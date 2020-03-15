const mongoose = require('mongoose');

let collectionSchema = mongoose.Schema({
    uid:{type:String},
    aid:{type:String},
    sort:{type:String},
    coll_time:{type:Date}
})

let collectionModel = mongoose.model("collections",collectionSchema,"collection");

module.exports = collectionModel;