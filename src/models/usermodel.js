const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    title: {tyep:String,enum:["Mr", "Mrs", "Miss"]},
    name: {type:String,trim:true, required:true},
   phone: {type:String, required:true, trim:true, unique:true},
   email: {type:String, required:true, trim:true, unique:true},  
   password: {type:String, required:true, min:8, max:15},
  address: {
    street: {type:String},
    city: {type:String},
    pincode: {type:String}
  }
},{timestamps: true})


const usermodel = mongoose.model('User', userSchema)
module.exports = usermodel