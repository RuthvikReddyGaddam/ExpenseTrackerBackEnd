const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
fullname:{
type: String,
required: true
},
email:{
type: String,
required: true
},
password: {
    type: String,
    required: true
},
phone:{
type: String,
required: true
},
address:{
type: String,
required: true
},
DoB:{
type: String,
required: true
},
gender: {
type: String,
required: true
},
balance: {
type: Number,
required: true
},
budget: {
type: Number,
required: true
},
goals:{
type: String,
required: true
},
profile: {
type: String,
required: true
},
});

module.exports = mongoose.model('User', userSchema);