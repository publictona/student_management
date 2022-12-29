const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

}, { timestamps: true })


const studentModel = mongoose.model('Student', studentSchema)
module.exports = studentModel