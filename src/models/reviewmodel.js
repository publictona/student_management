const mongoose =require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId


const reviewSchema = new mongoose.Schema({
    bookId: {type:ObjectId, ref:'Book', required:true,default:'Guest', value:{type:String}},
    reviewedAt: {type:Date,  required:true},
    rating: {type:Number, min:1, max:5, required:true},
    review: {type:String},
    isDeleted: {type:Boolean, default:false}


},{timestamps:true})


const reviewmodel = mongoose.model('Review', reviewSchema)
module.exports = reviewmodel