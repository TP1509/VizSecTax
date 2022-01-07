const mongoose = require('mongoose');
const schema = mongoose.Schema;

const entry = new schema({
    shortTitle: {
        type: String,
        required: true,
    },
    year: { 
        type: Number, 
        required: true, 
    },
    author: { 
        type: String, 
        required: true, 
    },
    categories:{
        type:Array,
        required: true,
    },
    reference:{
        type:String
    },
    URL:{
        type:String
    },
    created: { type: Date, default: Date.now }
})

module.exports = mongoose.model('entry', entry)