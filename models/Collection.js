const mongoose = require('mongoose')
   
const CollectionSchema = new mongoose.Schema({
    name: { type: String },
    date: { type: Date },
    state: { type: String }
})

module.exports = mongoose.model('Collection', CollectionSchema)